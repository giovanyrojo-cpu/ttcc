import { getLeads } from "@/lib/data";
import { PipelineStage } from "@/types/domain";

const stages: PipelineStage[] = [
  "Nuevo",
  "Contactado",
  "Interesado",
  "Cita",
  "Visita",
  "Propuesta",
  "Negociación",
  "Cerrado",
];

export default async function PipelinePage() {
  const leads = await getLeads();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gold">Pipeline</h1>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const inStage = leads.filter((l) => l.estatus_crm === stage);
          return (
            <div key={stage} className="min-w-[160px] bg-panel border border-line rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-300 mb-2">
                {stage} ({inStage.length})
              </div>
              <div className="space-y-2">
                {inStage.map((l) => (
                  <div key={l.id} className="bg-ink border border-line rounded-lg p-2 text-xs">
                    {l.empresa_o_persona}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
