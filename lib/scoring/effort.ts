import type { EffortResult } from "./types";

// PROVISIONAL: umbrales por confirmar con Jesús.
export const EFFORT_THRESHOLDS = {
  lowMaxHours: 4,
  mediumMaxHours: 16,
} as const;

// Esfuerzo estimado para avanzar la oportunidad. Es un campo independiente:
// no suma ni resta al Match Score ni al Opportunity Score.
export function effort(input: {
  estimatedHours: number | null;
}): EffortResult {
  const hours = input.estimatedHours;

  if (hours === null || !Number.isFinite(hours) || hours < 0) {
    return { level: "Sin estimar", estimated_hours: null };
  }

  if (hours <= EFFORT_THRESHOLDS.lowMaxHours) {
    return { level: "Bajo", estimated_hours: hours };
  }

  if (hours <= EFFORT_THRESHOLDS.mediumMaxHours) {
    return { level: "Medio", estimated_hours: hours };
  }

  return { level: "Alto", estimated_hours: hours };
}
