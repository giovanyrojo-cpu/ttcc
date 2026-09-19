import type { MatchBreakdown } from "@/lib/scoring";
import type { PhoneStatus } from "@/lib/search/phone";

export type AgentName =
  | "ATENEA"
  | "HERCULES"
  | "HERMES"
  | "HEFESTO"
  | "MONEY_ENGINE"
  | "ZEUS";

export type EvidenceLevel =
  | "confirmed"
  | "inferred"
  | "needs_verification";

export type AgentRunStatus =
  | "draft"
  | "ready"
  | "running"
  | "completed"
  | "failed";

export interface EvidenceItem {
  label: string;
  value: string;
  level: EvidenceLevel;
  source?: string;
}

export interface AteneaToHerculesBrief {
  version: "1.0";

  source_agent: "ATENEA";
  target_agent: "HERCULES";

  created_at: string;

  property: {
    id: string;
    title: string;
    type: string;
    location: string;

    surface_m2: number | null;
    price: number | null;
    currency: "MXN" | "USD";

    kva: number | null;
    loading_dock: boolean | null;
    land_use: string | null;
  };

  intelligence: {
    ideal_client: string;

    target_sectors: string[];

    strengths: string[];

    missing_information: string[];

    evidence: EvidenceItem[];
  };

  hunt_order: {
    objective: string;

    geography: string[];

    target_sectors: string[];

    target_roles: string[];

    buying_signals: string[];

    preferred_channels: string[];

    minimum_fit_score: number;
  };
}

// Constancia de que una persona hizo la llamada corta de validación.
export interface HumanValidation {
  validated_at: string;
  validated_by?: string;
}

export interface HerculesProspect {
  id?: string;

  company_or_person: string;

  industry?: string;

  location?: string;

  decision_maker?: string;

  role?: string;

  nationality?: string;

  // Solo se llena cuando la fuente verifica la ubicación.
  location_source?: "directory" | "vacancy";

  phone?: string;

  phone_status?: PhoneStatus;

  whatsapp?: string;

  email?: string;

  linkedin?: string;

  website?: string;

  signal?: string;

  signal_kind?: string;

  signal_source?: string;

  fit_score: number;

  match_breakdown?: MatchBreakdown;

  human_validation?: HumanValidation;

  priority:
    | "A"
    | "B"
    | "C"
    | "Nurture";

  status:
    | "discovered"
    | "researched"
    | "ready_for_contact"
    | "discarded";

  reason_for_fit: string;

  missing_information: string[];

  next_best_action: string;
}

export interface HerculesToHermesBrief {
  version: "1.0";

  source_agent: "HERCULES";
  target_agent: "HERMES";

  created_at: string;

  property_id: string;

  prospect: HerculesProspect;

  communication: {
    objective: string;

    recommended_channel:
      | "WhatsApp"
      | "LinkedIn"
      | "Email"
      | "Llamada";

    angle: string;

    facts_allowed: string[];

    claims_to_avoid: string[];

    next_best_action: string;
  };
}

export interface AgentRun<TInput = unknown, TOutput = unknown> {
  id: string;

  agent: AgentName;

  status: AgentRunStatus;

  created_at: string;

  input: TInput;

  output?: TOutput;

  errors?: string[];
}
