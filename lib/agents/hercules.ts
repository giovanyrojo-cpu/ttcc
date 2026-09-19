import type {
  AteneaToHerculesBrief,
  HerculesProspect,
} from "@/types/agents";
import {
  matchScore,
  propertyProfileFromBrief,
  type MatchProspect,
} from "@/lib/scoring";

// Los datos de contacto (tel\u00e9fono, correo, LinkedIn, web) son operativos:
// se guardan y se reportan como faltantes, pero no suman al Match Score.
export interface ProspectCandidate extends MatchProspect {
  company_or_person: string;

  phone?: string;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
  website?: string;
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

  return {
    company_or_person: candidate.company_or_person,

    industry: candidate.industry,
    location: candidate.location,

    decision_maker: candidate.decision_maker,
    role: candidate.role,

    phone: candidate.phone,
    whatsapp: candidate.whatsapp,
    email: candidate.email,
    linkedin: candidate.linkedin,
    website: candidate.website,

    signal: candidate.signal,
    signal_source: candidate.signal_source,

    fit_score: fitScore,
    match_breakdown: match.breakdown,
    priority,

    status:
      fitScore >= brief.hunt_order.minimum_fit_score
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
