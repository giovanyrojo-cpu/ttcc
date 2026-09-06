import { Lead, Comision, Property, Meta } from "@/types/domain";

// Datos semilla de ejemplo. Reemplazar por la migración real de la
// Bitácora de Cierre (marcar explícitamente los campos que falten,
// nunca inventarlos).

export const seedLeads: Lead[] = [
  {
    id: "1",
    empresa_o_persona: "Grupo Industrial Ejemplo",
    giro: "Manufactura",
    ubicacion: "El Marqués",
    contacto: "Por confirmar",
    cargo: "Gerente de Planta",
    telefono: null,
    whatsapp: null,
    email: null,
    linkedin: null,
    website: null,
    instagram: null,
    senal_intencion: "Búsqueda de nave industrial",
    fuente: "Inmuebles24",
    fecha_captura: new Date().toISOString(),
    propiedad_recomendada: null,
    motivo_encaje: null,
    score: null,
    prioridad: null,
    estatus_crm: "Nuevo",
    ultimo_contacto: null,
    proximo_seguimiento: null,
    next_best_action: null,
    notas: "Dato de ejemplo — reemplazar con datos reales de la Bitácora.",
    razon_perdida: null,
  },
];

export const seedProperties: Property[] = [
  {
    id: "1",
    tipo: "Industrial",
    titulo: "Bodega El Marqués 600 m²",
    ubicacion: "El Marqués, Querétaro",
    superficie_m2: 600,
    precio: null,
    moneda: "MXN",
    kva: 150,
    anden: true,
    uso_de_suelo: "Industrial",
    notas: "Dato de ejemplo — reemplazar con inventario real de TTP.",
    activo: true,
  },
];

export const seedComisiones: Comision[] = [];

export const seedMetas: Meta[] = [
  { id: "1", periodo: "mensual", metrica: "comision_mxn", objetivo: 500000, actual: 0 },
  { id: "2", periodo: "diaria", metrica: "llamadas", objetivo: 20, actual: 0 },
  { id: "3", periodo: "diaria", metrica: "seguimientos", objetivo: 15, actual: 0 },
  { id: "4", periodo: "semanal", metrica: "citas", objetivo: 5, actual: 0 },
  { id: "5", periodo: "semanal", metrica: "visitas", objetivo: 3, actual: 0 },
  { id: "6", periodo: "mensual", metrica: "propuestas", objetivo: 8, actual: 0 },
  { id: "7", periodo: "mensual", metrica: "cierres", objetivo: 2, actual: 0 },
];
