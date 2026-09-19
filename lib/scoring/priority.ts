import type { Priority } from "./types";

// A 80-100, B 65-79, C 50-64, Nurture <50.
export const PRIORITY_THRESHOLDS = {
  A: 80,
  B: 65,
  C: 50,
} as const;

export function scoreToPriority(score: number): Priority {
  if (score >= PRIORITY_THRESHOLDS.A) return "A";
  if (score >= PRIORITY_THRESHOLDS.B) return "B";
  if (score >= PRIORITY_THRESHOLDS.C) return "C";

  return "Nurture";
}
