import type { AteneaToHerculesBrief } from "@/types/agents";
import type { Lead, Property } from "@/types/domain";
import type { MatchProspect, PropertyProfile } from "./types";

// Propiedad + orden de cacería de Atenea → perfil contra el que se puntúa.
export function propertyProfileFromBrief(
  brief: AteneaToHerculesBrief
): PropertyProfile {
  return {
    id: brief.property.id,
    title: brief.property.title,
    type: brief.property.type,
    location: brief.property.location,

    surface_m2: brief.property.surface_m2,
    price: brief.property.price,
    currency: brief.property.currency,

    kva: brief.property.kva,
    loading_dock: brief.property.loading_dock,
    land_use: brief.property.land_use,

    target_sectors: brief.hunt_order.target_sectors,
    target_roles: brief.hunt_order.target_roles,
    buying_signals: brief.hunt_order.buying_signals,
    geography: brief.hunt_order.geography,
  };
}

// Propiedad del CRM. Los campos de búsqueda vienen de Atenea; sin ellos,
// los criterios que dependen de sectores, roles o señales no suman.
export function propertyProfileFromProperty(
  property: Property,
  hunt: Partial<
    Pick<
      PropertyProfile,
      "target_sectors" | "target_roles" | "buying_signals" | "geography"
    >
  > = {}
): PropertyProfile {
  return {
    id: property.id,
    title: property.titulo,
    type: property.tipo,
    location: property.ubicacion,

    surface_m2: property.superficie_m2,
    price: property.precio,
    currency: property.moneda,

    kva: property.kva,
    loading_dock: property.anden,
    land_use: property.uso_de_suelo,

    target_sectors: hunt.target_sectors ?? [],
    target_roles: hunt.target_roles ?? [],
    buying_signals: hunt.buying_signals ?? [],
    geography: hunt.geography ?? [],
  };
}

// Lead del CRM → prospecto. `fuente` del lead es de dónde llegó el contacto,
// no la fuente de la señal, así que no se usa como `signal_source`.
export function matchProspectFromLead(lead: Lead): MatchProspect {
  return {
    industry: lead.giro ?? undefined,
    location: lead.ubicacion ?? undefined,
    decision_maker: lead.contacto ?? undefined,
    role: lead.cargo ?? undefined,
    signal: lead.senal_intencion ?? undefined,
  };
}
