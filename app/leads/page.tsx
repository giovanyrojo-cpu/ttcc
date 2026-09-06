import { getLeads } from "@/lib/data";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gold">Leads</h1>
      <div className="space-y-2">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-panel border border-line rounded-xl p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{lead.empresa_o_persona}</div>
                <div className="text-xs text-gray-400">{lead.giro} · {lead.ubicacion}</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-line text-gray-300">
                {lead.estatus_crm}
              </span>
            </div>
            {lead.senal_intencion && (
              <p className="text-xs text-gray-400 mt-2">Señal: {lead.senal_intencion}</p>
            )}
            {lead.next_best_action && (
              <p className="text-xs text-gold mt-1">→ {lead.next_best_action}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
