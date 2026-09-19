// Interfaz desacoplada para conectar un proveedor de IA (p.ej. Claude API)
// más adelante SIN tocar el resto del sistema.
// El MVP usa el motor de reglas determinístico de abajo — NO IA de pago.

import { Lead } from "@/types/domain";
import {
  matchProspectFromLead,
  matchScore,
  type PropertyProfile,
} from "@/lib/scoring";

export interface AIProvider {
  suggestNextBestAction(lead: Lead): Promise<string>;
  // Match Score del lead contra una propiedad específica.
  // null si no hay propiedad contra la cual comparar.
  scoreLead(
    lead: Lead,
    property?: PropertyProfile
  ): Promise<number | null>;
}

// Implementación por defecto: reglas fijas, sin llamadas externas, costo cero.
export class RuleBasedProvider implements AIProvider {
  async scoreLead(
    lead: Lead,
    property?: PropertyProfile
  ): Promise<number | null> {
    if (!property) return null;

    return matchScore(matchProspectFromLead(lead), property).score;
  }

  async suggestNextBestAction(lead: Lead): Promise<string> {
    switch (lead.estatus_crm) {
      case "Nuevo":
        return "Investigar y calificar antes de contactar";
      case "Investigado":
        return "Hacer la llamada corta de validación antes de mover a Listo para contactar";
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
