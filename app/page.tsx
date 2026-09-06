import { getLeads, getComisiones, getMetas } from "@/lib/data";

function currency(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default async function DashboardPage() {
  const [leads, comisiones, metas] = await Promise.all([
    getLeads(),
    getComisiones(),
    getMetas(),
  ]);

  const metaMensual = metas.find(
    (m) => m.metrica === "comision_mxn" && m.periodo === "mensual"
  );

  const comisionCobrada = comisiones
    .filter((c) => c.estatus === "cobrada")
    .reduce((sum, c) => sum + c.monto_estimado, 0);

  const comisionPactada = comisiones
    .filter((c) => ["pactada", "facturada"].includes(c.estatus))
    .reduce((sum, c) => sum + c.monto_estimado, 0);

  const objetivo = metaMensual?.objetivo ?? 500000;
  const avance = objetivo > 0 ? Math.min(100, (comisionCobrada / objetivo) * 100) : 0;

  const hotLeads = leads.filter((l) => l.prioridad === "A");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gold">TOP TEN COMMAND CENTER</h1>
        <p className="text-sm text-gray-400">Director: Jesús Cruz Luna</p>
      </header>

      <section className="bg-panel border border-line rounded-xl p-4">
        <h2 className="text-sm text-gray-400 mb-1">Meta mensual — Money Engine</h2>
        <div className="text-2xl font-bold">{currency(comisionCobrada)} / {currency(objetivo)}</div>
        <div className="w-full bg-line rounded-full h-2 mt-2">
          <div
            className="bg-gold h-2 rounded-full"
            style={{ width: `${avance}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pactado/facturado sin cobrar: {currency(comisionPactada)}
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metas
          .filter((m) => m.metrica !== "comision_mxn")
          .map((m) => (
            <div key={m.id} className="bg-panel border border-line rounded-xl p-3">
              <div className="text-xs text-gray-400 capitalize">{m.metrica}</div>
              <div className="text-lg font-semibold">
                {m.actual} / {m.objetivo}
              </div>
              <div className="text-[10px] text-gray-500 capitalize">{m.periodo}</div>
            </div>
          ))}
      </section>

      <section>
        <h2 className="text-sm text-gray-400 mb-2">HOT Leads ({hotLeads.length})</h2>
        <div className="space-y-2">
          {hotLeads.length === 0 && (
            <p className="text-sm text-gray-500">Sin leads prioridad A por el momento.</p>
          )}
          {hotLeads.map((l) => (
            <div key={l.id} className="bg-panel border border-hot/40 rounded-xl p-3">
              <div className="font-semibold">{l.empresa_o_persona}</div>
              <div className="text-xs text-gray-400">{l.estatus_crm} · {l.next_best_action}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
