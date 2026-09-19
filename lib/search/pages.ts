export type PageFetcher = (
  url: string,
  options?: { maxPdfPages?: number }
) => Promise<string>;

// Cada lectura de Firecrawl cuesta créditos (los PDF, por página). El caché
// en memoria evita pagar la misma página en cada recarga del servidor.
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; markdown: string }>();

export const scrapePage: PageFetcher = async (url, options = {}) => {
  const key = `${url}|${options.maxPdfPages ?? ""}`;
  const hit = cache.get(key);

  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.markdown;

  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY no está configurada.");
  }

  const body: Record<string, unknown> = { url, formats: ["markdown"] };

  if (options.maxPdfPages) {
    body.parsers = [{ type: "pdf", maxPages: options.maxPdfPages }];
  }

  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(`Firecrawl ${response.status}: ${text.slice(0, 300)}`);
  }

  const payload = await response.json();
  const markdown = payload?.data?.markdown;

  if (typeof markdown !== "string" || markdown === "") {
    throw new Error(`Firecrawl no devolvió contenido para ${url}.`);
  }

  cache.set(key, { at: Date.now(), markdown });

  return markdown;
};
