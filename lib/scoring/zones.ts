// Zonas de Querétaro para comparar la ubicación del prospecto con la de la
// propiedad. "Querétaro" solo no basta: es el estado, la ciudad y el municipio.
//
// Es un catálogo editable. Solo incluye zonas respaldadas por una fuente,
// citada en cada una; lo que no está aquí queda como "zona sin verificar".

export type ZoneLevel = "municipio" | "zona";

export interface Zone {
  id: string;
  label: string;
  level: ZoneLevel;
  parent?: string;
  // Sin acentos ni signos, en minúsculas.
  aliases: string[];
  source: string;
}

export const ZONES: Zone[] = [
  // Municipios
  {
    id: "el-marques",
    label: "El Marqués",
    level: "municipio",
    aliases: ["el marques"],
    source: "Ficha de Peña Colorada y listados de Computrabajo.",
  },
  {
    id: "corregidora",
    label: "Corregidora",
    level: "municipio",
    aliases: ["corregidora"],
    source: "Municipio de Querétaro.",
  },
  {
    id: "queretaro",
    label: "Querétaro (municipio)",
    level: "municipio",
    // "Querétaro, Querétaro" se resuelve aparte: solo no basta.
    aliases: ["santiago de queretaro"],
    source: "Municipio de Querétaro.",
  },
  {
    id: "colon",
    label: "Colón",
    level: "municipio",
    aliases: ["colon"],
    source: "Municipio de Querétaro.",
  },
  {
    id: "san-juan-del-rio",
    label: "San Juan del Río",
    level: "municipio",
    aliases: ["san juan del rio"],
    source: "Municipio de Querétaro.",
  },
  {
    id: "pedro-escobedo",
    label: "Pedro Escobedo",
    level: "municipio",
    aliases: ["pedro escobedo"],
    source: "Municipio de Querétaro.",
  },
  {
    id: "huimilpan",
    label: "Huimilpan",
    level: "municipio",
    aliases: ["huimilpan"],
    source: "Municipio de Querétaro.",
  },

  // Zonas
  {
    id: "pena-colorada",
    label: "Peña Colorada",
    level: "zona",
    parent: "el-marques",
    aliases: ["pena colorada"],
    source: 'Ficha pública de TTP: "Peña Colorada, El Marqués".',
  },
  {
    id: "parque-tecnologico-innovacion",
    label: "Parque Tecnológico Innovación",
    level: "zona",
    parent: "el-marques",
    aliases: ["parque tecnologico innovacion"],
    source: "Inventario de TTP: Parque Tecnológico Innovación, El Marqués.",
  },
  {
    id: "balvanera",
    label: "Balvanera",
    level: "zona",
    parent: "corregidora",
    aliases: ["balvanera"],
    source:
      "Fichas de TTP y directorio PIQ (Av. Balvanera). POR CONFIRMAR: municipio Corregidora.",
  },
  {
    id: "santa-rosa-jauregui",
    label: "Santa Rosa Jáuregui",
    level: "zona",
    parent: "queretaro",
    aliases: ["santa rosa jauregui"],
    source: "Vynmsa: dirección postal del PIQ, C.P. 76220.",
  },
  {
    id: "piq",
    label: "Parque Industrial Querétaro (PIQ)",
    level: "zona",
    parent: "santa-rosa-jauregui",
    // El PIQ está en el km 28.5 de la carretera Querétaro–San Luis Potosí
    // (MexicoIndustry). Otros kilómetros no son del parque.
    aliases: ["parque industrial queretaro", "piq", "km 28 5"],
    source:
      "Vynmsa dice Santa Rosa Jáuregui; un resumen de búsqueda dijo El Marqués. POR CONFIRMAR el municipio.",
  },
  {
    id: "juriquilla",
    label: "Juriquilla",
    level: "zona",
    parent: "queretaro",
    aliases: ["juriquilla"],
    source: "Delegación del municipio de Querétaro.",
  },
  {
    id: "queretaro-poniente",
    label: "Querétaro poniente",
    level: "zona",
    parent: "queretaro",
    aliases: ["poniente"],
    source: 'Zona indicada por Jesús ("poniente").',
  },
  {
    id: "el-fenix",
    label: "El Fénix",
    level: "zona",
    parent: "queretaro-poniente",
    aliases: ["el fenix"],
    source:
      "Ficha de TTP (Condominio El Fénix); coordenadas aproximadas 20.5984, -100.4103.",
  },
];

const BY_ID = new Map(ZONES.map((zone) => [zone.id, zone]));

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Un municipio precedido de un tipo de calle ("Av. El Marqués") es el nombre
// de una calle, no la ubicación.
const STREET_TYPES = new Set([
  "av",
  "avenida",
  "calle",
  "privada",
  "priv",
  "cerrada",
  "cda",
  "blvd",
  "boulevard",
  "carretera",
  "carr",
  "camino",
  "paseo",
  "prolongacion",
  "andador",
  "libramiento",
  "calzada",
]);

const CONNECTORS = new Set(["de", "del", "la", "el"]);

function isStreetName(tokens: string[], index: number) {
  const previous = tokens[index - 1];

  if (previous === undefined) return false;
  if (STREET_TYPES.has(previous)) return true;

  return CONNECTORS.has(previous) && STREET_TYPES.has(tokens[index - 2]);
}

function occurrences(tokens: string[], alias: string[]) {
  const found: number[] = [];

  for (let i = 0; i + alias.length <= tokens.length; i += 1) {
    if (alias.every((word, offset) => tokens[i + offset] === word)) {
      found.push(i);
    }
  }

  return found;
}

// Zonas que el texto nombra, con sus zonas padre (Peña Colorada → El Marqués).
export function resolveZones(text: string | undefined): Zone[] {
  const folded = fold(text ?? "");

  if (!folded) return [];

  const tokens = folded.split(" ");
  const ids: string[] = [];

  for (const zone of ZONES) {
    for (const alias of zone.aliases) {
      const positions = occurrences(tokens, alias.split(" "));
      const valid = positions.filter(
        (index) => zone.level !== "municipio" || !isStreetName(tokens, index)
      );

      if (valid.length > 0) ids.push(zone.id);
    }
  }

  // "Querétaro, Querétaro" (municipio, estado) sí es el municipio.
  if (/\bqueretaro queretaro\b/.test(folded)) ids.push("queretaro");

  const chain = new Map<string, Zone>();

  for (const id of ids) {
    let current = BY_ID.get(id);

    while (current) {
      chain.set(current.id, current);
      current = current.parent ? BY_ID.get(current.parent) : undefined;
    }
  }

  return Array.from(chain.values());
}

export type ZoneMatch =
  | "same_zone"
  | "same_municipality"
  | "different"
  | "unknown_prospect"
  | "unknown_property";

export interface ZoneComparison {
  match: ZoneMatch;
  property_zones: string[];
  prospect_zones: string[];
  shared?: string;
}

// Misma zona: comparten una zona específica, o comparten el municipio cuando
// la propiedad solo se conoce a nivel municipio. Mismo municipio pero otra
// zona: coincidencia parcial.
export function compareZones(
  propertyText: string | undefined,
  prospectText: string | undefined
): ZoneComparison {
  const property = resolveZones(propertyText);
  const prospect = resolveZones(prospectText);
  const labels = (zones: Zone[]) => zones.map((zone) => zone.label);
  const base = {
    property_zones: labels(property),
    prospect_zones: labels(prospect),
  };

  if (property.length === 0) return { match: "unknown_property", ...base };
  if (prospect.length === 0) return { match: "unknown_prospect", ...base };

  const shared = property.filter((zone) =>
    prospect.some((other) => other.id === zone.id)
  );
  const sharedZone = shared.find((zone) => zone.level === "zona");
  const sharedMunicipality = shared.find((zone) => zone.level === "municipio");
  const propertyHasZone = property.some((zone) => zone.level === "zona");

  if (sharedZone) {
    return { match: "same_zone", shared: sharedZone.label, ...base };
  }

  if (sharedMunicipality) {
    return {
      match: propertyHasZone ? "same_municipality" : "same_zone",
      shared: sharedMunicipality.label,
      ...base,
    };
  }

  return { match: "different", ...base };
}
