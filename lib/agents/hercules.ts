import type {
  AteneaToHerculesBrief,
  HerculesProspect,
} from "@/types/agents";

export interface ProspectCandidate {
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
}

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function calculateFitScore(
  candidate: ProspectCandidate,
  brief: AteneaToHerculesBrief
): number {
  let score = 0;

  const industry = normalize(candidate.industry);
  const location = normalize(candidate.location);
  const role = normalize(candidate.role);
  const signal = normalize(candidate.signal);

  // 1. INDUSTRIA — máximo 25
  const sectorMatch = brief.hunt_order.target_sectors.some((sector) => {
    const normalizedSector = normalize(sector);

    return (
      industry.includes(normalizedSector) ||
      normalizedSector.includes(industry)
    );
  });

  if (candidate.industry && sectorMatch) {
    score += 25;
  }

  // 2. UBICACIÓN — máximo 15
  const geographyMatch = brief.hunt_order.geography.some((geo) => {
    const normalizedGeo = normalize(geo);

    return (
      location.includes(normalizedGeo) ||
      normalizedGeo.includes(location)
    );
  });

  if (candidate.location && geographyMatch) {
    score += 15;
  }

  // 3. DECISOR IDENTIFICADO — máximo 15
  if (candidate.decision_maker) {
    score += 8;
  }

  const roleMatch = brief.hunt_order.target_roles.some((targetRole) => {
    const normalizedRole = normalize(targetRole);

    return (
      role.includes(normalizedRole) ||
      normalizedRole.includes(role)
    );
  });

  if (candidate.role && roleMatch) {
    score += 7;
  }

  // 4. SEÑAL DE COMPRA — máximo 25
  const signalMatch = brief.hunt_order.buying_signals.some((buyingSignal) => {
    const normalizedSignal = normalize(buyingSignal);

    return (
      signal.includes(normalizedSignal) ||
      normalizedSignal.includes(signal)
    );
  });

  if (candidate.signal && signalMatch) {
    score += 15;
  }

  // Una señal sin fuente no debe valer igual que una señal verificable.
  if (candidate.signal && candidate.signal_source) {
    score += 10;
  }

  // 5. CONTACTABILIDAD — máximo 20
  if (candidate.whatsapp) {
    score += 8;
  } else if (candidate.phone) {
    score += 5;
  }

  if (candidate.email) {
    score += 4;
  }

  if (candidate.linkedin) {
    score += 4;
  }

  if (candidate.website) {
    score += 4;
  }

  return Math.min(100, score);
}

export function scoreToPriority(
  score: number
): "A" | "B" | "C" | "Nurture" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";

  return "Nurture";
}

export function qualifyProspect(
  candidate: ProspectCandidate,
  brief: AteneaToHerculesBrief
): HerculesProspect {
  const fitScore = calculateFitScore(candidate, brief);
  const priority = scoreToPriority(fitScore);

  const missingInformation: string[] = [];

  if (!candidate.industry) {
    missingInformation.push("Giro o industria");
  }

  if (!candidate.location) {
    missingInformation.push("Ubicación");
  }

  if (!candidate.decision_maker) {
    missingInformation.push("Nombre del decisor");
  }

  if (!candidate.role) {
    missingInformation.push("Cargo del decisor");
  }

  if (!candidate.whatsapp && !candidate.phone) {
    missingInformation.push("Teléfono o WhatsApp");
  }

  if (!candidate.signal) {
    missingInformation.push("Señal comercial");
  }

  if (candidate.signal && !candidate.signal_source) {
    missingInformation.push("Fuente verificable de la señal");
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
