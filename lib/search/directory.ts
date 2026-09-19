import { resolveZones } from "@/lib/scoring/zones";
import { checkPhoneFormat, isReliablePhone } from "./phone";
import type { PageFetcher } from "./pages";
import { scrapePage } from "./pages";
import { DIRECTORY_SOURCES } from "./sources";
import type { ProspectSearchProvider, RawProspect } from "./types";

export interface PiqEntry {
  name: string;
  nationality: string;
  industry: string;
  phone_raw: string;
  address: string;
}

export interface CompanyListing {
  name: string;
  description?: string;
  sector?: string;
  location?: string;
  active_vacancies: number;
}

// Directorio del Parque Industrial Querétaro: tabla de cinco columnas
// (empresa, nacionalidad, giro, conmutador, dirección).
export function parsePiqDirectory(markdown: string): PiqEntry[] {
  const entries: PiqEntry[] = [];

  for (const line of markdown.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    if (/^\|\s*-{2,}/.test(line.trim())) continue;

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length !== 5) continue;
    if (/empresa|empiresa/i.test(cells[0]) && /giro/i.test(cells[2])) continue;
    if (cells[0] === "") continue;

    entries.push({
      name: cells[0],
      nationality: cells[1],
      industry: cells[2],
      phone_raw: cells[3],
      address: cells[4],
    });
  }

  return entries;
}

export function piqProspects(
  entries: PiqEntry[],
  sourceUrl: string
): RawProspect[] {
  return entries.map((entry) => {
    const check = checkPhoneFormat(entry.phone_raw);
    const reliable = isReliablePhone(check);

    return {
      company_or_person: entry.name,
      industry: entry.industry || undefined,
      nationality: entry.nationality || undefined,

      // La dirección la publica el directorio: ubicación verificada. Se agrega
      // el parque solo si la dirección no nombra ya otra zona (hay empresas
      // del directorio en Balvanera o Juriquilla) ni es una carretera con un
      // kilómetro que no es el del parque: esas quedan como zona sin verificar.
      location: entry.address
        ? resolveZones(entry.address).length > 0 || /\bkm\b/i.test(entry.address)
          ? entry.address
          : `${entry.address}, Parque Industrial Querétaro`
        : undefined,
      location_source: entry.address ? "directory" : undefined,

      phone: reliable ? check.number : undefined,
      phone_raw: entry.phone_raw || undefined,
      phone_status: check.status,

      source: "directory",
      source_url: sourceUrl,
      discovered_at: new Date().toISOString(),
    } satisfies RawProspect;
  });
}

// Listado de empresas de Computrabajo: cada empresa empieza con "- ## [Nombre](url)".
export function parseComputrabajoCompanies(markdown: string): CompanyListing[] {
  const listings: CompanyListing[] = [];

  for (const block of markdown.split(/^- ## /m).slice(1)) {
    const head = /^\[([^\]]+)\]\([^)]*\)/.exec(block);

    if (!head) continue;

    const lines = block
      .slice(head[0].length)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const offersIndex = lines.findIndex((line) => line.startsWith("[Ver ofertas]"));
    const beforeOffers = offersIndex === -1 ? lines : lines.slice(0, offersIndex);
    const bullets = lines
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).trim());

    const vacanciesBullet = bullets.find((bullet) => /puestos? vacantes?/i.test(bullet));
    const vacancyCount = /(\d+)\s+puestos?/i.exec(vacanciesBullet ?? "");

    // Descripción = texto libre antes del enlace "Ver ofertas" (sin las
    // evaluaciones ni el sector, que se repiten como etiquetas).
    const description = beforeOffers.filter(
      (line) => !/evaluaciones/i.test(line) && line !== "Fabricación"
    )[0];

    listings.push({
      name: head[1].trim(),
      description: description || undefined,
      sector: bullets.find((bullet) => bullet === "Fabricación"),
      location: bullets.find((bullet) => bullet.includes(",")),
      active_vacancies: vacancyCount ? Number(vacancyCount[1]) : 0,
    });
  }

  return listings;
}

export function companyListingProspects(
  listings: CompanyListing[],
  sourceUrl: string
): RawProspect[] {
  return listings.map(
    (listing) =>
      ({
        company_or_person: listing.name,
        industry: listing.description ?? listing.sector,

        location: listing.location,
        location_source: listing.location ? "directory" : undefined,

        // Las vacantes activas se anotan, pero no son señal: el listado no
        // dice el puesto. La señal solo sale del listado de vacantes por puesto.
        vacancy_count: listing.active_vacancies || undefined,

        source: "directory",
        source_url: sourceUrl,
        discovered_at: new Date().toISOString(),
      }) satisfies RawProspect
  );
}

export function createDirectoryProvider(
  fetchPage: PageFetcher = scrapePage
): ProspectSearchProvider {
  return {
    name: "directory",

    async search() {
      const prospects: RawProspect[] = [];

      for (const source of DIRECTORY_SOURCES) {
        try {
          if (source.kind === "piq_pdf") {
            const markdown = await fetchPage(source.url, {
              maxPdfPages: source.maxPdfPages,
            });

            prospects.push(...piqProspects(parsePiqDirectory(markdown), source.url));
          } else {
            const markdown = await fetchPage(source.url);

            prospects.push(
              ...companyListingProspects(
                parseComputrabajoCompanies(markdown),
                source.url
              )
            );
          }
        } catch (error) {
          console.error(`Directorio: no se pudo leer ${source.url}`, error);
        }
      }

      return prospects;
    },
  };
}
