import type { Property } from "@/types/domain";
import type {
  AteneaToHerculesBrief,
  EvidenceItem,
} from "@/types/agents";

export function analyzeProperty(property: Property) {
  const strengths: string[] = [];
  const missingInformation: string[] = [];
  const targetSectors: string[] = [];
  const evidence: EvidenceItem[] = [];

  // SUPERFICIE
  if (property.superficie_m2) {
    strengths.push(
      `${property.superficie_m2.toLocaleString("es-MX")} m² disponibles`
    );

    evidence.push({
      label: "Superficie",
      value: `${property.superficie_m2} m²`,
      level: "confirmed",
    });
  } else {
    missingInformation.push("Superficie exacta");
  }

  // PRECIO
  if (property.precio) {
    strengths.push(
      `Precio registrado: ${property.precio.toLocaleString("es-MX")} ${property.moneda}`
    );

    evidence.push({
      label: "Precio",
      value: `${property.precio} ${property.moneda}`,
      level: "confirmed",
    });
  } else {
    missingInformation.push("Precio actualizado");
  }

  // ENERGÍA
  if (property.kva && property.kva > 0) {
    strengths.push(
      `Capacidad eléctrica registrada: ${property.kva} kVA`
    );

    evidence.push({
      label: "Capacidad eléctrica",
      value: `${property.kva} kVA`,
      level: "confirmed",
    });
  } else if (property.tipo === "Industrial") {
    missingInformation.push("Capacidad eléctrica disponible");
  }

  // ANDÉN
  if (property.anden === true) {
    strengths.push("Cuenta con andén");

    evidence.push({
      label: "Andén",
      value: "Sí",
      level: "confirmed",
    });
  } else if (property.tipo === "Industrial") {
    missingInformation.push(
      "Confirmar andén, rampa y condiciones de carga"
    );
  }

  // USO DE SUELO
  if (property.uso_de_suelo) {
    strengths.push(
      `Uso de suelo registrado: ${property.uso_de_suelo}`
    );

    evidence.push({
      label: "Uso de suelo",
      value: property.uso_de_suelo,
      level: "confirmed",
    });
  } else {
    missingInformation.push("Uso de suelo vigente");
  }

  // SECTORES OBJETIVO
  if (property.tipo === "Industrial") {
    targetSectors.push(
      "Manufactura",
      "Logística y distribución",
      "Automotriz y autopartes",
      "Metalmecánica"
    );

    if (property.kva && property.kva >= 150) {
      targetSectors.push(
        "Plásticos",
        "Procesos con demanda eléctrica relevante"
      );
    }
  }

  if (property.tipo === "Terreno") {
    targetSectors.push(
      "Desarrolladores",
      "Empresas en expansión",
      "Inversionistas patrimoniales"
    );
  }

  if (property.tipo === "Oficina") {
    targetSectors.push(
      "Servicios profesionales",
      "Corporativos",
      "Tecnología",
      "Consultoría"
    );
  }

  if (property.tipo === "Residencial") {
    targetSectors.push(
      "Ejecutivos",
      "Familias",
      "Relocation",
      "Inversionistas"
    );
  }

  // CLIENTE IDEAL
  let idealClient =
    "Prospecto cuya necesidad inmobiliaria coincida con ubicación, precio y características.";

  if (property.tipo === "Industrial") {
    idealClient =
      `Empresa industrial o logística que requiera aproximadamente ${
        property.superficie_m2
          ? property.superficie_m2.toLocaleString("es-MX") + " m²"
          : "la superficie disponible"
      } en ${property.ubicacion}` +
      `${
        property.kva
          ? ` y cuya operación sea compatible con ${property.kva} kVA registrados`
          : ""
      }.`;
  }

  if (property.tipo === "Terreno") {
    idealClient =
      `Empresa, desarrollador o inversionista buscando expansión, desarrollo o reserva estratégica en ${property.ubicacion}.`;
  }

  if (property.tipo === "Oficina") {
    idealClient =
      `Empresa o profesionista que requiera operación administrativa o comercial en ${property.ubicacion}.`;
  }

  if (property.tipo === "Residencial") {
    idealClient =
      `Comprador, arrendatario, ejecutivo o familia cuyo presupuesto y zona objetivo coincidan con ${property.ubicacion}.`;
  }

  return {
    idealClient,
    targetSectors,
    strengths,
    missingInformation,
    evidence,
  };
}

export function createHuntBrief(
  property: Property
): AteneaToHerculesBrief {
  const analysis = analyzeProperty(property);

  return {
    version: "1.0",

    source_agent: "ATENEA",
    target_agent: "HERCULES",

    created_at: new Date().toISOString(),

    property: {
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
    },

    intelligence: {
      ideal_client: analysis.idealClient,
      target_sectors: analysis.targetSectors,
      strengths: analysis.strengths,
      missing_information: analysis.missingInformation,
      evidence: analysis.evidence,
    },

    hunt_order: {
      objective:
        `Encontrar prospectos reales compatibles con ${property.titulo}.`,

      geography: [
        property.ubicacion,
        "Querétaro",
      ],

      target_sectors: analysis.targetSectors,

      target_roles: [
        "Director General",
        "Director de Operaciones",
        "Gerente de Planta",
        "Director de Expansión",
        "Facilities",
        "Real Estate",
        "Supply Chain",
      ],

      buying_signals: [
        "Expansión",
        "Nueva planta",
        "Relocalización",
        "Nearshoring",
        "Contratación",
        "Nueva inversión",
        "Aumento de capacidad",
        "Cambio de instalaciones",
      ],

      preferred_channels: [
        "WhatsApp",
        "LinkedIn",
        "Email",
        "Llamada",
      ],

      minimum_fit_score: 65,
    },
  };
}
