import { companyKey } from "./employers";
import type {
  ProspectSearchProvider,
  RawProspect,
  SearchRequest,
} from "./types";

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "";
}

// Une dos registros de la misma empresa (p. ej. directorio + vacante).
// Solo rellena huecos: un dato ya presente nunca se sobrescribe.
function mergeProspects(base: RawProspect, extra: RawProspect): RawProspect {
  const merged: RawProspect = { ...base };

  for (const [field, value] of Object.entries(extra)) {
    const key = field as keyof RawProspect;

    if (isEmpty(merged[key]) && !isEmpty(value)) {
      (merged as unknown as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}

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

  // La misma empresa se reconoce por su nombre sin sufijos legales ni
  // geografía; los registros de distintas fuentes se combinan.
  const unique = new Map<string, RawProspect>();

  for (const prospect of all) {
    const key = companyKey(prospect.company_or_person);
    const previous = unique.get(key);

    unique.set(key, previous ? mergeProspects(previous, prospect) : prospect);
  }

  // El límite se aplica a la lista ya unida. Para no descartar candidatos
  // antes de puntuarlos, quien llama debe pasar un límite amplio y recortar
  // después de calificar.
  return Array.from(unique.values()).slice(0, request.limit ?? 50);
}
