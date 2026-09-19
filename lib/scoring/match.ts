import { scoreToPriority } from "./priority";
import { sectorMatches } from "./sectors";
import { compareZones } from "./zones";
import type {
  CriterionResult,
  MatchProspect,
  MatchScoreResult,
  PropertyProfile,
} from "./types";

// Match Score sobre 100: prospecto CONTRA una propiedad específica.
// La contactabilidad (teléfono, correo, LinkedIn, web) es un dato operativo
// y NO suma puntos.
export const MATCH_WEIGHTS = {
  fit: 25,
  intent: 25,
  capacity: 15,
  location: 15,
  access: 10,
  urgency: 10,
} as const;

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function textMatches(value: string | undefined, options: string[]) {
  const normalizedValue = normalize(value);

  if (!normalizedValue) return false;

  return options.some((option) => {
    const normalizedOption = normalize(option);

    return (
      normalizedOption !== "" &&
      (normalizedValue.includes(normalizedOption) ||
        normalizedOption.includes(normalizedValue))
    );
  });
}

function criterion(
  points: number,
  max: number,
  notes: string[]
): CriterionResult {
  return { points: Math.round(points), max, notes };
}

// 1. FIT INMOBILIARIO — máximo 25
// Cada atributo de la propiedad que se pueda comparar pesa lo mismo.
// Si el prospecto no informa su necesidad, ese atributo cuenta como no
// cumplido y se pide verificación.
function scoreFit(
  prospect: MatchProspect,
  property: PropertyProfile,
  missing: string[]
): CriterionResult {
  const max = MATCH_WEIGHTS.fit;
  const checks: { label: string; result: boolean | null }[] = [];

  if (property.target_sectors.length > 0) {
    if (!prospect.industry) missing.push("Giro o industria");

    checks.push({
      label: "Giro compatible con la propiedad",
      result: prospect.industry
        ? sectorMatches(prospect.industry, property.target_sectors)
        : null,
    });
  }

  const surface = property.surface_m2;

  if (surface !== null) {
    const required = prospect.required_surface_m2;
    const known =
      required !== undefined &&
      (required.min !== undefined || required.max !== undefined);

    if (!known) missing.push("Superficie que requiere el prospecto");

    checks.push({
      label: `Superficie de ${surface} m²`,
      result: known
        ? surface >= (required.min ?? 0) &&
          surface <= (required.max ?? Infinity)
        : null,
    });
  }

  const kva = property.kva;

  if (kva !== null) {
    if (prospect.required_kva === undefined) {
      missing.push("kVA que requiere el prospecto");
    }

    checks.push({
      label: `Potencia de ${kva} kVA`,
      result:
        prospect.required_kva === undefined
          ? null
          : kva >= prospect.required_kva,
    });
  }

  if (property.loading_dock !== null) {
    if (prospect.needs_loading_dock === undefined) {
      missing.push("Si el prospecto requiere andén de carga");
    }

    checks.push({
      label: "Andén de carga",
      result:
        prospect.needs_loading_dock === undefined
          ? null
          : !prospect.needs_loading_dock || property.loading_dock === true,
    });
  }

  if (checks.length === 0) {
    return criterion(0, max, [
      "La propiedad no tiene atributos comparables.",
    ]);
  }

  const satisfied = checks.filter((check) => check.result === true).length;

  const notes = checks.map((check) => {
    const state =
      check.result === null
        ? "sin dato"
        : check.result
          ? "cumple"
          : "no cumple";

    return `${check.label}: ${state}`;
  });

  return criterion((max * satisfied) / checks.length, max, notes);
}

// 2. SEÑAL DE INTENCIÓN — máximo 25
// La señal debe corresponder a las de esta propiedad. Una señal sin fuente
// no vale igual que una verificable.
function scoreIntent(
  prospect: MatchProspect,
  property: PropertyProfile,
  missing: string[]
): CriterionResult {
  const max = MATCH_WEIGHTS.intent;
  const notes: string[] = [];
  let points = 0;

  const signal = prospect.signal_kind ?? prospect.signal;

  if (!signal) {
    missing.push("Señal comercial");

    return criterion(0, max, ["Sin señal de intención."]);
  }

  if (textMatches(signal, property.buying_signals)) {
    points += 15;
    notes.push("Señal corresponde a las de la propiedad.");

    if (prospect.signal_source) {
      points += 10;
      notes.push("Señal con fuente verificable.");
    } else {
      missing.push("Fuente verificable de la señal");
      notes.push("Señal sin fuente.");
    }
  } else {
    notes.push("La señal no corresponde a las de la propiedad.");
  }

  return criterion(points, max, notes);
}

// 3. CAPACIDAD ECONÓMICA — máximo 15
// Presupuesto verificado del prospecto contra el precio de la propiedad.
function scoreCapacity(
  prospect: MatchProspect,
  property: PropertyProfile,
  missing: string[]
): CriterionResult {
  const max = MATCH_WEIGHTS.capacity;

  if (!prospect.budget) {
    missing.push("Presupuesto del prospecto");

    return criterion(0, max, ["Sin presupuesto verificado."]);
  }

  if (property.price === null) {
    missing.push("Precio de la propiedad");

    return criterion(0, max, ["La propiedad no tiene precio."]);
  }

  if (prospect.budget.currency !== property.currency) {
    missing.push("Presupuesto y precio en monedas distintas");

    return criterion(0, max, [
      "Monedas distintas: falta un tipo de cambio verificado.",
    ]);
  }

  return prospect.budget.amount >= property.price
    ? criterion(max, max, ["El presupuesto cubre el precio."])
    : criterion(0, max, ["El presupuesto no cubre el precio."]);
}

// 4. UBICACIÓN — máximo 15
// Se compara la ZONA (municipio, colonia, parque), no el texto: "Querétaro"
// solo no distingue nada. Misma zona = completo; mismo municipio pero otra
// zona = la mitad (PROVISIONAL); otra zona o zona sin verificar = 0.
function scoreLocation(
  prospect: MatchProspect,
  property: PropertyProfile,
  missing: string[]
): CriterionResult {
  const max = MATCH_WEIGHTS.location;

  if (!prospect.location) {
    missing.push("Ubicación");

    return criterion(0, max, ["Sin ubicación del prospecto."]);
  }

  const comparison = compareZones(property.location, prospect.location);
  const where = comparison.prospect_zones.join(" / ");

  switch (comparison.match) {
    case "same_zone":
      return criterion(max, max, [`Misma zona: ${comparison.shared}.`]);

    case "same_municipality":
      return criterion(max / 2, max, [
        `Mismo municipio (${comparison.shared}), otra zona: ${where}.`,
      ]);

    case "different":
      return criterion(0, max, [`Otra zona: ${where}.`]);

    case "unknown_property":
      missing.push("Zona de la propiedad no reconocida (agregar a zones.ts)");

      return criterion(0, max, ["La zona de la propiedad no está en el catálogo."]);

    default:
      missing.push("Zona del prospecto sin verificar");

      return criterion(0, max, [
        "La ubicación no permite ubicar una zona concreta.",
      ]);
  }
}

// 5. ACCESO AL DECISOR — máximo 10
// Decisor identificado (5) + cargo objetivo de la propiedad (5).
function scoreAccess(
  prospect: MatchProspect,
  property: PropertyProfile,
  missing: string[]
): CriterionResult {
  const max = MATCH_WEIGHTS.access;
  const notes: string[] = [];
  let points = 0;

  if (prospect.decision_maker) {
    points += 5;
    notes.push("Decisor identificado.");
  } else {
    missing.push("Nombre del decisor");
  }

  if (!prospect.role) {
    missing.push("Cargo del decisor");
  } else if (textMatches(prospect.role, property.target_roles)) {
    points += 5;
    notes.push("Cargo corresponde a los cargos objetivo.");
  } else {
    notes.push("Cargo fuera de los cargos objetivo.");
  }

  return criterion(points, max, notes);
}

// 6. URGENCIA — máximo 10
// Completa con fuente; sin fuente vale la mitad.
function scoreUrgency(
  prospect: MatchProspect,
  missing: string[]
): CriterionResult {
  const max = MATCH_WEIGHTS.urgency;

  if (!prospect.urgency) {
    missing.push("Señal de urgencia");

    return criterion(0, max, ["Sin señal de urgencia."]);
  }

  if (prospect.urgency_source) {
    return criterion(max, max, ["Urgencia con fuente verificable."]);
  }

  missing.push("Fuente de la urgencia");

  return criterion(max / 2, max, ["Urgencia sin fuente."]);
}

export function matchScore(
  prospect: MatchProspect,
  property: PropertyProfile
): MatchScoreResult {
  const missing: string[] = [];

  const breakdown = {
    fit: scoreFit(prospect, property, missing),
    intent: scoreIntent(prospect, property, missing),
    capacity: scoreCapacity(prospect, property, missing),
    location: scoreLocation(prospect, property, missing),
    access: scoreAccess(prospect, property, missing),
    urgency: scoreUrgency(prospect, missing),
  };

  const total = Object.values(breakdown).reduce(
    (sum, item) => sum + item.points,
    0
  );

  const score = Math.max(0, Math.min(100, total));

  return {
    score,
    priority: scoreToPriority(score),
    breakdown,
    missing: Array.from(new Set(missing)),
  };
}
