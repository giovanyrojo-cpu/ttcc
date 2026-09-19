// Fuentes de la cacería. Directorios = base (quién, dónde, giro, teléfono);
// vacantes = capa de señal (cuándo hay actividad).
// Solo se listan URLs ya comprobadas; para agregar otras, verificar antes que
// existan y que su formato lo entienda el parser correspondiente.

export const DIRECTORY_SOURCES = [
  {
    kind: "piq_pdf",
    url: "https://piq.com.mx/files/DIRECTORIO_EMPRESAS_PIQ_2024.pdf",
    // El PDF trae 6 páginas; Firecrawl cobra un crédito por página.
    maxPdfPages: 6,
  },
  {
    kind: "computrabajo_companies",
    url: "https://mx.computrabajo.com/empresas/empresas-de-fabricacion-en-el-marques",
  },
] as const;

export const VACANCY_SOURCES = [
  {
    kind: "computrabajo_vacancies",
    url: "https://mx.computrabajo.com/trabajo-de-montacarguista-en-el-marques",
  },
] as const;
