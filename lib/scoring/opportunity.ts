import type { ComisionTipo, PipelineStage } from "@/types/domain";
import type {
  AxisLevel,
  AxisResult,
  OpportunityClass,
  OpportunityResult,
} from "./types";

// PROVISIONAL: umbrales por confirmar con Jesús. Se anclan a la meta de
// $500,000 MXN/mes: impacto alto = una operación que aporta ~20% de la meta.
export const OPPORTUNITY_THRESHOLDS = {
  impactHighMxn: 100_000,
  impactMediumMxn: 30_000,
  speedHighMaxDays: 30,
  speedMediumMaxDays: 90,
  // Producto de los tres ejes (alto=3, medio=2, bajo=1; rango 1-27).
  hotMinProduct: 18,
  warmMinProduct: 6,
} as const;

// PROVISIONAL: probabilidad de cierre según la etapa del pipeline.
// null = la oportunidad ya no está abierta.
export const STAGE_PROBABILITY: Record<PipelineStage, AxisLevel | null> = {
  Nuevo: "bajo",
  Investigado: "bajo",
  "Listo para contactar": "bajo",
  Contactado: "bajo",
  "Se mandó y no contestó": "bajo",
  "No es WhatsApp": "bajo",
  "Follow-up": "bajo",
  Interesado: "medio",
  Cita: "medio",
  Visita: "medio",
  Propuesta: "alto",
  Negociación: "alto",
  "Contestó y no hay interés": null,
  Cerrado: null,
  Perdido: null,
};

const LEVEL_VALUE: Record<AxisLevel, number> = {
  alto: 3,
  medio: 2,
  bajo: 1,
};

export interface OpportunityInput {
  stage: PipelineStage;

  // Valor sobre el que se calcula la comisión (venta: precio; renta: la base
  // de comisión acordada). Requerido para comisión porcentual.
  dealValue: number | null;
  currency: "MXN" | "USD";
  // Tipo de cambio verificado; requerido si currency es USD.
  usdToMxn?: number;

  // Mismo criterio que Comision: % o monto fijo (en MXN), sin IVA.
  commission: { tipo: ComisionTipo; valor: number } | null;

  estimatedDaysToClose: number | null;

  // Estimación propia de Jesús; reemplaza la que sale de la etapa.
  probabilityOverride?: AxisLevel;
}

function toMxn(
  value: number,
  currency: "MXN" | "USD",
  usdToMxn?: number
): number | null {
  if (currency === "MXN") return value;

  return usdToMxn && usdToMxn > 0 ? value * usdToMxn : null;
}

function expectedCommissionMxn(
  input: OpportunityInput,
  missing: string[]
): number | null {
  if (!input.commission) {
    missing.push("Comisión pactada o probable");

    return null;
  }

  if (input.commission.tipo === "monto_fijo") {
    return input.commission.valor;
  }

  if (input.dealValue === null) {
    missing.push("Valor de la operación");

    return null;
  }

  const valueMxn = toMxn(input.dealValue, input.currency, input.usdToMxn);

  if (valueMxn === null) {
    missing.push("Tipo de cambio USD→MXN verificado");

    return null;
  }

  return (valueMxn * input.commission.valor) / 100;
}

function impactAxis(commissionMxn: number | null): AxisResult {
  if (commissionMxn === null) {
    return { level: "bajo", detail: "Sin datos para calcular la comisión." };
  }

  const formatted = `$${Math.round(commissionMxn).toLocaleString("es-MX")} MXN`;

  if (commissionMxn >= OPPORTUNITY_THRESHOLDS.impactHighMxn) {
    return { level: "alto", detail: `Comisión probable ${formatted}.` };
  }

  if (commissionMxn >= OPPORTUNITY_THRESHOLDS.impactMediumMxn) {
    return { level: "medio", detail: `Comisión probable ${formatted}.` };
  }

  return { level: "bajo", detail: `Comisión probable ${formatted}.` };
}

function speedAxis(days: number | null, missing: string[]): AxisResult {
  if (days === null || !Number.isFinite(days) || days < 0) {
    missing.push("Tiempo estimado de cierre");

    return { level: "bajo", detail: "Sin tiempo estimado de cierre." };
  }

  if (days <= OPPORTUNITY_THRESHOLDS.speedHighMaxDays) {
    return { level: "alto", detail: `Cierre estimado en ${days} días.` };
  }

  if (days <= OPPORTUNITY_THRESHOLDS.speedMediumMaxDays) {
    return { level: "medio", detail: `Cierre estimado en ${days} días.` };
  }

  return { level: "bajo", detail: `Cierre estimado en ${days} días.` };
}

function classify(product: number): OpportunityClass {
  if (product >= OPPORTUNITY_THRESHOLDS.hotMinProduct) return "HOT";
  if (product >= OPPORTUNITY_THRESHOLDS.warmMinProduct) return "WARM";

  return "COLD";
}

// Opportunity Score: clasificación HOT/WARM/COLD por tres ejes —
// impacto (valor × comisión probable) × probabilidad de cierre × velocidad.
// No es un número 0-100 y no incluye el esfuerzo.
export function opportunityScore(input: OpportunityInput): OpportunityResult {
  const missing: string[] = [];
  const notes: string[] = [];

  const commission = expectedCommissionMxn(input, missing);
  const impact = impactAxis(commission);
  const speed = speedAxis(input.estimatedDaysToClose, missing);

  const stageProbability = STAGE_PROBABILITY[input.stage];

  const probability: AxisResult =
    input.probabilityOverride !== undefined
      ? {
          level: input.probabilityOverride,
          detail: "Estimación manual.",
        }
      : {
          level: stageProbability ?? "bajo",
          detail: `Según la etapa: ${input.stage}.`,
        };

  const isOpen = stageProbability !== null;

  if (!isOpen) {
    notes.push(`La oportunidad no está abierta (${input.stage}).`);
  }

  const product =
    LEVEL_VALUE[impact.level] *
    LEVEL_VALUE[probability.level] *
    LEVEL_VALUE[speed.level];

  return {
    classification: isOpen ? classify(product) : "COLD",
    axes: { impact, probability, speed },
    expected_commission_mxn: commission,
    missing: Array.from(new Set(missing)),
    notes,
  };
}
