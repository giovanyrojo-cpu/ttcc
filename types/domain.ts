// Tipos de dominio de Top Ten Command Center (TTCC)
// Reflejan el pipeline y modelo de datos definidos en el PRD (Bloque 1).

export type PipelineStage =
  | "Nuevo"
  | "Investigado"
  | "Listo para contactar"
  | "Contactado"
  | "Se mandó y no contestó"
  | "Contestó y no hay interés"
  | "No es WhatsApp"
  | "Interesado"
  | "Cita"
  | "Visita"
  | "Propuesta"
  | "Negociación"
  | "Cerrado"
  | "Perdido"
  | "Follow-up";

export type ScorePriority = "A" | "B" | "C" | "Nurture";

export interface Lead {
  id: string;
  empresa_o_persona: string;
  giro: string | null;
  ubicacion: string | null;
  contacto: string | null;
  cargo: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  linkedin: string | null;
  website: string | null;
  instagram: string | null;
  senal_intencion: string | null;
  fuente: string | null;
  fecha_captura: string;
  propiedad_recomendada: string | null;
  motivo_encaje: string | null;
  score: number | null;
  prioridad: ScorePriority | null;
  estatus_crm: PipelineStage;
  ultimo_contacto: string | null;
  proximo_seguimiento: string | null;
  next_best_action: string | null;
  notas: string | null;
  razon_perdida: string | null;
}

export type ComisionTipo = "porcentaje" | "monto_fijo";
export type ComisionEstatus =
  | "potencial"
  | "pactada"
  | "facturada"
  | "cobrada"
  | "repartida";

export interface Comision {
  id: string;
  lead_id: string | null;
  propiedad: string | null;
  tipo: ComisionTipo;
  valor: number; // % o monto fijo según tipo
  monto_estimado: number;
  reparto_asesor: string | null;
  reparto_porcentaje: number | null;
  iva_aplica: boolean;
  estatus: ComisionEstatus;
  fecha_estimada_cierre: string | null;
  fecha_cobro: string | null;
  notas: string | null;
}

export interface Property {
  id: string;
  tipo: "Industrial" | "Terreno" | "Oficina" | "Residencial" | "Otro";
  titulo: string;
  ubicacion: string;
  superficie_m2: number | null;
  precio: number | null;
  moneda: "MXN" | "USD";
  kva: number | null;
  anden: boolean | null;
  uso_de_suelo: string | null;
  notas: string | null;
  activo: boolean;
}

export interface Meta {
  id: string;
  periodo: "diaria" | "semanal" | "mensual" | "anual";
  metrica:
    | "comision_mxn"
    | "llamadas"
    | "seguimientos"
    | "citas"
    | "visitas"
    | "propuestas"
    | "cierres"
    | "captaciones"
    | "contenido";
  objetivo: number;
  actual: number;
}

export interface Interaction {
  id: string;
  lead_id: string;
  canal: "WhatsApp" | "Llamada" | "Email" | "LinkedIn" | "Presencial" | "Otro";
  resumen: string;
  fecha: string;
}
