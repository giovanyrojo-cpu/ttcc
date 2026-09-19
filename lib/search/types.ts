import type { PhoneStatus } from "./phone";

export type ProspectSource =
  | "google"
  | "google_maps"
  | "firecrawl"
  | "company_website"
  | "news"
  | "linkedin"
  | "directory"
  | "vacancy"
  | "manual";

export interface RawProspect {
  company_or_person: string;
  industry?: string;
  nationality?: string;

  // Solo se llena cuando la fuente verifica la ubicación (dirección de un
  // directorio o lugar de una vacante). Nunca se copia de la búsqueda.
  location?: string;
  location_source?: "directory" | "vacancy";

  decision_maker?: string;
  role?: string;

  // `phone` solo se llena si el número es confiable (confirmado, o con
  // formato válido para Querétaro). Si no, el original queda en `phone_raw`.
  phone?: string;
  phone_raw?: string;
  phone_status?: PhoneStatus;
  phone_confirmed_by?: string;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
  website?: string;

  signal?: string;
  // Señal canónica (p. ej. "Contratación"): se compara contra las señales de
  // la propiedad sin depender de que el texto coincida.
  signal_kind?: string;
  signal_source?: string;
  vacancy_count?: number;

  source?: ProspectSource;
  source_url?: string;

  discovered_at?: string;
}

export interface SearchRequest {
  property_id: string;
  property_title: string;

  geography: string[];
  target_sectors: string[];
  target_roles: string[];
  buying_signals: string[];

  limit?: number;
}

export interface ProspectSearchProvider {
  name: string;

  search(
    request: SearchRequest
  ): Promise<RawProspect[]>;
}
