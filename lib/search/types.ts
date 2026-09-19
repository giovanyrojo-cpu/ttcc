export type ProspectSource =
  | "google"
  | "google_maps"
  | "firecrawl"
  | "company_website"
  | "news"
  | "linkedin"
  | "manual";

export interface RawProspect {
  company_or_person: string;
  industry?: string;
  location?: string;

  decision_maker?: string;
  role?: string;

  phone?: string;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
  website?: string;

  signal?: string;
  signal_source?: string;

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
