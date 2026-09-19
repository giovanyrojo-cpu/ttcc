import type {
  ProspectSearchProvider,
  RawProspect,
  SearchRequest,
} from "./types";

export async function searchProspects(
  request: SearchRequest,
  providers: ProspectSearchProvider[]
): Promise<RawProspect[]> {
  const settled = await Promise.allSettled(
    providers.map((provider) => provider.search(request))
  );

  const all = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  // Deduplicación básica por empresa + web/teléfono.
  const unique = new Map<string, RawProspect>();

  for (const prospect of all) {
    const key = [
      prospect.company_or_person?.toLowerCase().trim(),
      prospect.website?.toLowerCase().trim() ?? "",
      prospect.phone?.replace(/\D/g, "") ?? "",
    ].join("|");

    const previous = unique.get(key);

    if (!previous) {
      unique.set(key, prospect);
      continue;
    }

    // Conservamos la versión que tenga más información.
    const completeness = (p: RawProspect) =>
      Object.values(p).filter(
        (value) => value !== undefined && value !== null && value !== ""
      ).length;

    if (completeness(prospect) > completeness(previous)) {
      unique.set(key, prospect);
    }
  }

  return Array.from(unique.values()).slice(0, request.limit ?? 50);
}
