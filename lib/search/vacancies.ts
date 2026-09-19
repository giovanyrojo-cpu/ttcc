import { companyKey, isAnonymousEmployer, isStaffingAgency } from "./employers";
import type { PageFetcher } from "./pages";
import { scrapePage } from "./pages";
import { VACANCY_SOURCES } from "./sources";
import type { ProspectSearchProvider, RawProspect } from "./types";

export interface Vacancy {
  role: string;
  employer: string;
  location?: string;
  posted_label?: string;
  // Antigüedad en días; null si la bolsa no la indica.
  posted_days: number | null;
  offer_url: string;
}

// Una vacante más vieja ya no es señal de actividad actual.
export const MAX_VACANCY_AGE_DAYS = 30;

const AGE_LINE = /^(Hace .+|Ayer|Hoy|Más de \d+ días)$/;

export function parsePostedDays(label: string): number | null {
  const text = label.trim().toLowerCase();

  if (text === "hoy") return 0;
  if (text === "ayer") return 1;

  const more = /^más de (\d+) días$/.exec(text);

  if (more) return Number(more[1]) + 1;

  const ago = /^hace (\d+) (hora|horas|día|días|semana|semanas|mes|meses)$/.exec(
    text
  );

  if (!ago) return null;

  const amount = Number(ago[1]);
  const unit = ago[2];

  if (unit.startsWith("hora")) return 0;
  if (unit.startsWith("d")) return amount;
  if (unit.startsWith("semana")) return amount * 7;

  return amount * 30;
}

// Listado de vacantes de Computrabajo: cada oferta empieza con "## [Puesto](url)".
export function parseComputrabajoVacancies(markdown: string): Vacancy[] {
  const vacancies: Vacancy[] = [];

  for (const block of markdown.split(/^## /m).slice(1)) {
    const head = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(block);

    if (!head) continue;

    const offerUrl = head[2].split("\\#")[0].split("#")[0];
    const lines = block
      .slice(head[0].length)
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line !== "" &&
          !/^Postulado\s+Vista$/.test(line) &&
          !/^\d(\.\d)?$/.test(line)
      );

    if (lines.length === 0) continue;

    const employerLink = /^\[([^\]]+)\]\([^)]*\)$/.exec(lines[0]);
    const employer = (employerLink ? employerLink[1] : lines[0]).trim();
    const location = lines[1] && !lines[1].startsWith("$") ? lines[1] : undefined;
    const postedLabel = lines.find((line) => AGE_LINE.test(line));

    vacancies.push({
      role: head[1].trim(),
      employer,
      location,
      posted_label: postedLabel,
      posted_days: postedLabel ? parsePostedDays(postedLabel) : null,
      offer_url: offerUrl,
    });
  }

  return vacancies;
}

// Vacantes → prospectos. Se descartan agencias de personal, vacantes sin
// nombre de empresa y vacantes sin fecha o vencidas. El lugar de la vacante
// es una ubicación verificada; la contratación es una señal canónica.
export function vacancyProspects(
  vacancies: Vacancy[],
  listingUrl: string
): RawProspect[] {
  const byEmployer = new Map<string, Vacancy[]>();

  for (const vacancy of vacancies) {
    if (
      isStaffingAgency(vacancy.employer) ||
      isAnonymousEmployer(vacancy.employer)
    ) {
      continue;
    }

    if (
      vacancy.posted_days === null ||
      vacancy.posted_days > MAX_VACANCY_AGE_DAYS
    ) {
      continue;
    }

    const key = companyKey(vacancy.employer);
    byEmployer.set(key, [...(byEmployer.get(key) ?? []), vacancy]);
  }

  return Array.from(byEmployer.values()).map((employerVacancies) => {
    const freshest = [...employerVacancies].sort(
      (a, b) => (a.posted_days ?? 0) - (b.posted_days ?? 0)
    )[0];

    return {
      company_or_person: freshest.employer,

      location: freshest.location,
      location_source: freshest.location ? "vacancy" : undefined,

      signal: `Vacante activa: ${freshest.role}${
        freshest.posted_label ? ` (${freshest.posted_label.toLowerCase()})` : ""
      }`,
      signal_kind: "Contratación",
      signal_source: freshest.offer_url,
      vacancy_count: employerVacancies.length,

      source: "vacancy",
      source_url: listingUrl,
      discovered_at: new Date().toISOString(),
    } satisfies RawProspect;
  });
}

export function createVacancyProvider(
  fetchPage: PageFetcher = scrapePage
): ProspectSearchProvider {
  return {
    name: "vacancies",

    async search() {
      const prospects: RawProspect[] = [];

      for (const source of VACANCY_SOURCES) {
        try {
          const markdown = await fetchPage(source.url);

          prospects.push(
            ...vacancyProspects(parseComputrabajoVacancies(markdown), source.url)
          );
        } catch (error) {
          console.error(`Vacantes: no se pudo leer ${source.url}`, error);
        }
      }

      return prospects;
    },
  };
}
