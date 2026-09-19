import type {
  AteneaToHerculesBrief,
  HerculesProspect,
  HumanValidation,
} from "@/types/agents";
import {
  matchScore,
  propertyProfileFromBrief,
  type MatchProspect,
} from "@/lib/scoring";
import type { PhoneStatus } from "@/lib/search/phone";

// Los datos de contacto (teléfono, correo, LinkedIn, web) son operativos:
// se guardan y se reportan como faltantes, pero no suman al Match Score.
export interface ProspectCandidate extends MatchProspect {
  company_or_person: string;

  nationality?: string;

  // Solo viene cuando la fuente verifica la ubicación (directorio o vacante).
  location_source?: "directory" | "vacancy";

  phone?: string;
  // Teléfono tal como lo publicó la fuente, cuando no pasó la validación.
  phone_raw?: string;
  phone_status?: PhoneStatus;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
  website?: string;

  // Solo existe si una persona hizo la llamada corta de validación.
  // No suma puntos: únicamente abre la compuerta hacia "ready_for_contact".
  human_validation?: HumanValidation;
}

export function qualifyProspect(
  candidate: ProspectCandidate,
  brief: AteneaToHerculesBrief
): HerculesProspect {
  // Se puntúa contra la propiedad específica de la orden, no contra un
  // brief genérico. La lógica vive en lib/scoring.
  const match = matchScore(candidate, propertyProfileFromBrief(brief));
  const fitScore = match.score;
  const priority = match.priority;

  const missingInformation = [...match.missing];

  // El contacto es un dato operativo: se reporta, pero no puntúa.
  if (!candidate.whatsapp && !candidate.phone) {
    missingInformation.push("Teléfono o WhatsApp");
  }

  if (!candidate.phone && candidate.phone_raw) {
    missingInformation.push(
      "Teléfono del directorio sin formato válido para Querétaro: verificar"
    );
  }

  if (candidate.phone && candidate.phone_status === "format_valid") {
    missingInformation.push("Segunda fuente del teléfono (solo formato válido)");
  }

  // Compuerta de validación humana: un score obtenido solo con cacería
  // nunca pasa a "ready_for_contact" sin que alguien haya hecho la llamada
  // corta. El score puede ser suficiente; la validación es aparte.
  const meetsThreshold =
    fitScore >= brief.hunt_order.minimum_fit_score;
  const validated = candidate.human_validation !== undefined;
  const pendingValidation =
    !validated &&
    (meetsThreshold || priority === "A" || priority === "B");

  if (pendingValidation) {
    missingInformation.push("Validación humana (llamada corta)");
  }

  const reasons: string[] = [];

  if (candidate.industry) {
    reasons.push(`Industria: ${candidate.industry}`);
  }

  if (candidate.location) {
    reasons.push(`Ubicación: ${candidate.location}`);
  }

  if (candidate.signal && candidate.signal_source) {
    reasons.push("Existe señal comercial con fuente");
  }

  if (candidate.decision_maker) {
    reasons.push("Decisor identificado");
  }

  let nextBestAction = "Continuar investigación";

  if (priority === "A") {
    nextBestAction =
      "Entregar a HERMES para contacto prioritario";
  } else if (priority === "B") {
    nextBestAction =
      "Completar información faltante y preparar contacto";
  } else if (priority === "C") {
    nextBestAction =
      "Investigar señales adicionales antes de contactar";
  }

  if (pendingValidation) {
    nextBestAction =
      "Llamada corta de validación (superficie, kVA, andén, presupuesto) antes de pasar a HERMES";
  }

  return {
    company_or_person: candidate.company_or_person,

    industry: candidate.industry,
    nationality: candidate.nationality,
    location: candidate.location,
    location_source: candidate.location_source,

    decision_maker: candidate.decision_maker,
    role: candidate.role,

    phone: candidate.phone,
    phone_status: candidate.phone_status,
    whatsapp: candidate.whatsapp,
    email: candidate.email,
    linkedin: candidate.linkedin,
    website: candidate.website,

    signal: candidate.signal,
    signal_kind: candidate.signal_kind,
    signal_source: candidate.signal_source,

    fit_score: fitScore,
    match_breakdown: match.breakdown,
    priority,

    human_validation: candidate.human_validation,

    status:
      meetsThreshold && validated
        ? "ready_for_contact"
        : "researched",

    reason_for_fit:
      reasons.length > 0
        ? reasons.join(" · ")
        : "Información insuficiente para determinar encaje.",

    missing_information: missingInformation,

    next_best_action: nextBestAction,
  };
}

export function createHuntSummary(
  brief: AteneaToHerculesBrief
) {
  return {
    property_id: brief.property.id,

    property_title: brief.property.title,

    objective: brief.hunt_order.objective,

    geography: brief.hunt_order.geography,

    sectors: brief.hunt_order.target_sectors,

    roles: brief.hunt_order.target_roles,

    buying_signals: brief.hunt_order.buying_signals,

    minimum_fit_score:
      brief.hunt_order.minimum_fit_score,
  };
}
