// Coincidencia de giro por raíz de palabra y familia de sinónimos, no por
// texto exacto: "Almacenaje logístico" y "Logística y distribución" comparten
// la raíz "logist"; "Fabricación de piezas" pertenece a la familia Manufactura.

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function words(value: string) {
  return fold(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length >= 3);
}

// Palabras demasiado genéricas para servir de raíz común: en un directorio de
// parque industrial casi todas las empresas son "industriales" o "de servicios".
const GENERIC_WORDS = new Set([
  "para",
  "con",
  "sobre",
  "entre",
  "servicio",
  "servicios",
  "empresa",
  "empresas",
  "industria",
  "industrial",
  "industriales",
  "proceso",
  "operacion",
  "operaciones",
  "procesos",
  "demanda",
  "relevante",
  "general",
  "sector",
  "producto",
  "productos",
  "material",
  "materiales",
  "venta",
]);

function stems(value: string) {
  return words(value)
    .filter((word) => word.length >= 4 && !GENERIC_WORDS.has(word))
    .map((word) => word.slice(0, 6));
}

// Cada familia agrupa raíces que, en el giro de una empresa, indican ese sector.
const SECTOR_FAMILIES: { name: string; roots: string[] }[] = [
  {
    name: "manufactura",
    roots: [
      "manufactur",
      "fabric",
      "ensambl",
      "maquil",
      "inyeccion",
      "extrusion",
      "moldeo",
      "troquel",
      "estampad",
    ],
  },
  {
    name: "logistica",
    roots: [
      "logist",
      "distribu",
      "almacen",
      "paqueter",
      "bodega",
      "transport",
      "mensajer",
      "cedis",
    ],
  },
  {
    name: "automotriz",
    roots: ["automotri", "autopart", "automovil", "vehicul"],
  },
  {
    name: "metalmecanica",
    roots: [
      "metalmec",
      "metal",
      "maquinad",
      "troquel",
      "estampad",
      "solda",
      "herramient",
      "herramental",
      "molde",
      "fundicion",
      "forja",
    ],
  },
  {
    name: "corte-laser",
    roots: ["laser", "corte", "plasma", "cnc", "doblez", "troquel", "lamina"],
  },
  {
    name: "plasticos",
    roots: ["plastic", "polimer", "inyeccion", "extrusion", "polietilen"],
  },
  {
    name: "electrico",
    roots: ["electric", "electron", "electromec"],
  },
];

// Las raíces largas también cuentan dentro de palabras compuestas
// ("intralogística", "prefabricados"); las cortas solo al inicio.
function startsWithRoot(word: string, roots: string[]) {
  return roots.some(
    (root) => word.startsWith(root) || (root.length >= 6 && word.includes(root))
  );
}

// ¿El giro del prospecto corresponde a alguno de los sectores objetivo?
export function sectorMatches(
  industry: string | undefined,
  sectors: string[]
): boolean {
  const normalizedIndustry = fold(industry ?? "").trim();

  if (!normalizedIndustry) return false;

  const industryWords = words(normalizedIndustry);
  const industryStems = new Set(stems(normalizedIndustry));

  return sectors.some((sector) => {
    const normalizedSector = fold(sector).trim();

    if (!normalizedSector) return false;

    // 1. Coincidencia literal (el comportamiento anterior se conserva).
    if (
      normalizedIndustry.includes(normalizedSector) ||
      normalizedSector.includes(normalizedIndustry)
    ) {
      return true;
    }

    // 2. Raíz de palabra común (logístic-, manufactur-, tecnol-…).
    if (stems(normalizedSector).some((stem) => industryStems.has(stem))) {
      return true;
    }

    // 3. Familia de sinónimos del sector.
    const sectorWords = words(normalizedSector);

    return SECTOR_FAMILIES.some(
      (family) =>
        sectorWords.some((word) => startsWithRoot(word, family.roots)) &&
        industryWords.some((word) => startsWithRoot(word, family.roots))
    );
  });
}
