// Tipos del módulo único de scoring de TTP.
// Match Score (0-100), Opportunity Score (HOT/WARM/COLD) y Esfuerzo son tres
// cosas independientes: ninguna alimenta a las otras.

export type Priority = "A" | "B" | "C" | "Nurture";

// Propiedad específica contra la que se compara al prospecto.
// Los campos de búsqueda (sectores, roles, señales, geografía) vienen de
// Atenea, que ya los deriva de esta propiedad.
export interface PropertyProfile {
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

  target_sectors: string[];
  target_roles: string[];
  buying_signals: string[];
  geography: string[];
}

// Lo que sabemos del prospecto. Todo es opcional: un dato ausente suma 0
// y se reporta en `missing`, nunca se rellena con un valor plausible.
export interface MatchProspect {
  industry?: string;
  location?: string;

  decision_maker?: string;
  role?: string;

  signal?: string;
  signal_source?: string;

  // Necesidades verificadas del prospecto frente a la propiedad.
  required_surface_m2?: { min?: number; max?: number };
  required_kva?: number;
  needs_loading_dock?: boolean;

  // Presupuesto verificado, en la misma operación (renta/venta) que el precio.
  budget?: { amount: number; currency: "MXN" | "USD" };

  urgency?: string;
  urgency_source?: string;
}

export interface CriterionResult {
  points: number;
  max: number;
  notes: string[];
}

export interface MatchBreakdown {
  fit: CriterionResult;
  intent: CriterionResult;
  capacity: CriterionResult;
  location: CriterionResult;
  access: CriterionResult;
  urgency: CriterionResult;
}

export interface MatchScoreResult {
  score: number;
  priority: Priority;
  breakdown: MatchBreakdown;
  // Datos que faltan para poder puntuar — etiqueta "Requiere verificación".
  missing: string[];
}

export type OpportunityClass = "HOT" | "WARM" | "COLD";

// Nivel de cada eje. En velocidad, "alto" significa cierre rápido.
export type AxisLevel = "alto" | "medio" | "bajo";

export interface AxisResult {
  level: AxisLevel;
  detail: string;
}

export interface OpportunityResult {
  classification: OpportunityClass;
  axes: {
    impact: AxisResult;
    probability: AxisResult;
    speed: AxisResult;
  };
  // Comisión probable en MXN; null si no se pudo calcular con datos reales.
  expected_commission_mxn: number | null;
  missing: string[];
  notes: string[];
}

export type EffortLevel = "Bajo" | "Medio" | "Alto" | "Sin estimar";

export interface EffortResult {
  level: EffortLevel;
  estimated_hours: number | null;
}
