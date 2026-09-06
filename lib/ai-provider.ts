// Interfaz desacoplada para conectar un proveedor de IA (p.ej. Claude API)
// más adelante SIN tocar el resto del sistema.
// El MVP usa el motor de reglas determinístico de abajo — NO IA de pago.

import { Lead } from "@/types/domain";

export interface AIProvider {
  suggestNextBestAction(lead: Lead): Promise<string>;
  scoreLead(lead: Lead): Promise<number>;
}

// Implementación por defecto: reglas fijas, sin llamadas externas, costo cero.
export class RuleBasedProvider implements AIProvider {
  async scoreLead(lead: Lead): Promise<number> {
    let score = 0;

    if (lead.whatsapp) score += 20;
    if (lead.senal_intencion) score += 25;
    if (lead.cargo) score += 10;
    if (lead.propiedad_recomendada) score += 15;
    if (lead.ubicacion) score += 10;
    if (lead.fuente) score += 5;
    if (
      ["Interesado", "Cita", "Visita", "Propuesta", "Negociación"].includes(
        lead.estatus_crm
      )
    ) {
      score += 15;
    }

    return Math.min(100, score);
  }

  async suggestNextBestAction(lead: Lead): Promise<string> {
    switch (lead.estatus_crm) {
      case "Nuevo":
        return "Investigar y calificar antes de contactar";
      case "Investigado":
        return "Mover a listo para contactar";
      case "Listo para contactar":
        return "Enviar primer mensaje por WhatsApp o LinkedIn";
      case "Contactado":
        return "Esperar respuesta; programar recordatorio en 24-48h";
      case "Se mandó y no contestó":
        return "Follow-up día 3 con nueva información de valor";
      case "Interesado":
        return "Agendar cita";
      case "Cita":
        return "Confirmar cita 24h antes";
      case "Visita":
        return "Enviar propuesta dentro de 48h post-visita";
      case "Propuesta":
        return "Dar seguimiento a la propuesta en 2-3 días";
      case "Negociación":
        return "Cerrar condiciones y fecha de firma";
      default:
        return "Revisar manualmente";
    }
  }
}

export function scoreToPriority(score: number): "A" | "B" | "C" | "Nurture" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "Nurture";
}
