function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Palabras que no distinguen a una empresa de otra: sufijos legales,
// artículos y la geografía que casi todas repiten en su nombre.
const NOISE_TOKENS = new Set([
  "sa",
  "cv",
  "rl",
  "sdrl",
  "sapi",
  "sas",
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "y",
  "mexico",
  "mx",
  "queretaro",
  "qro",
]);

export function companyTokens(name: string): string[] {
  return fold(name)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 1 && !NOISE_TOKENS.has(token));
}

// Clave para reconocer a la misma empresa en fuentes distintas
// ("ALTCAM MEXICO, S.A. DE C.V." y "Altcam" comparten clave).
export function companyKey(name: string): string {
  const key = companyTokens(name).join(" ");

  return key || fold(name).trim();
}

const AGENCY_PATTERN =
  /staff|reclutamiento|recursos humanos|capital humano|talento humano|bolsa de trabajo|outsourcing|adecco|manpower|randstad|kelly services|gi group|\bhays\b|\bpersonal\b/;

// Agencias de personal: publican vacantes de otras empresas, así que su
// nombre no dice quién es el empleador real.
export function isStaffingAgency(name: string): boolean {
  return AGENCY_PATTERN.test(fold(name));
}

const ANONYMOUS_PATTERN =
  /^(una\s+)?(importante|reconocid[ao]|prestigios[ao]|gran)?\s*(empresa|compania)\s+(del?\s+(sector|giro|ramo)|dedicad|lider|transnacional|multinacional|nacional)|^compania\s+del\s+sector/;

// Vacantes sin nombre ("Importante empresa del sector automotriz"):
// no hay a quién prospectar.
export function isAnonymousEmployer(name: string): boolean {
  return ANONYMOUS_PATTERN.test(fold(name).trim());
}
