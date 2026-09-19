import { realBuyingSignals } from "./signals";
import type {
  ProspectSearchProvider,
  RawProspect,
  SearchRequest,
} from "./types";

type FirecrawlResult = {
  title?: string;
  description?: string;
  url?: string;
};

function buildQueries(request: SearchRequest): string[] {
  const geography = request.geography.join(" ");
  const sectors = request.target_sectors.slice(0, 4);

  return sectors.map(
    (sector) =>
      `"${sector}" "${geography}" empresa planta expansión manufactura`
  );
}

export const firecrawlProspectProvider: ProspectSearchProvider = {
  name: "firecrawl",

  async search(request: SearchRequest): Promise<RawProspect[]> {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY no está configurada.");
    }

    const queries = buildQueries(request);
    const prospects: RawProspect[] = [];

    for (const query of queries) {
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit: 10,
          sources: ["web"],
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Firecrawl ${response.status}: ${text.slice(0, 300)}`
        );
      }

      const payload = await response.json();

      const results: FirecrawlResult[] =
        payload?.data?.web ??
        payload?.data ??
        [];

      for (const result of results) {
        if (!result?.title || !result?.url) continue;

        // El fragmento solo es señal si muestra una señal de compra que NO
        // sea eco de las palabras de la consulta.
        const hasRealSignal =
          realBuyingSignals(
            result.description,
            request.buying_signals,
            query
          ).length > 0;

        prospects.push({
          company_or_person: result.title,
          industry: undefined,
          // La geografía de la búsqueda no es la ubicación del prospecto:
          // sin ubicación verificada no se asigna ninguna.
          location: undefined,
          decision_maker: undefined,
          role: undefined,
          phone: undefined,
          whatsapp: undefined,
          email: undefined,
          linkedin: undefined,
          website: result.url,
          signal: hasRealSignal ? result.description : undefined,
          signal_source: hasRealSignal ? result.url : undefined,
          source: "firecrawl",
          source_url: result.url,
          discovered_at: new Date().toISOString(),
        });
      }
    }

    const unique = new Map<string, RawProspect>();

    for (const prospect of prospects) {
      const key =
        prospect.source_url?.toLowerCase() ||
        prospect.company_or_person.toLowerCase();

      if (!unique.has(key)) {
        unique.set(key, prospect);
      }
    }

    return Array.from(unique.values()).slice(0, request.limit ?? 50);
  },
};
