import type { Property } from "@/types/domain";
import { createHuntBrief } from "@/lib/agents/atenea";
import { qualifyProspect } from "@/lib/agents/hercules";

export function createHuntPreview(property: Property) {
  const brief = createHuntBrief(property);

  const candidates = [
    {
      company_or_person: "EMPRESA DEMO ALPHA",
      industry: "Manufactura",
      location: "El Marqués, Querétaro",
      decision_maker: "Director de Operaciones",
      role: "Director de Operaciones",
      phone: "4420000001",
      whatsapp: "4420000001",
      email: "operaciones@demo-alpha.test",
      linkedin: "https://linkedin.com/company/demo-alpha",
      website: "https://demo-alpha.test",
      signal: "Expansión",
      signal_source: "Fuente demo verificable",
    },
    {
      company_or_person: "EMPRESA DEMO BETA",
      industry: "Plásticos",
      location: "Querétaro",
      decision_maker: undefined,
      role: undefined,
      phone: "4420000002",
      whatsapp: undefined,
      email: undefined,
      linkedin: undefined,
      website: "https://demo-beta.test",
      signal: "Aumento de capacidad",
      signal_source: undefined,
    },
    {
      company_or_person: "EMPRESA DEMO GAMMA",
      industry: "Servicios",
      location: "Querétaro",
      decision_maker: undefined,
      role: undefined,
      phone: undefined,
      whatsapp: undefined,
      email: undefined,
      linkedin: undefined,
      website: undefined,
      signal: undefined,
      signal_source: undefined,
    },
  ];

  return candidates
    .map((candidate) => qualifyProspect(candidate, brief))
    .sort((a, b) => b.fit_score - a.fit_score);
}
