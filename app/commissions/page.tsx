import { getComisiones } from "@/lib/data";

function currency(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

const estatusColor: Record<string, string> = {
  potencial: "bg-line text-gray-300",
  pactada: "bg-warm/30 text-warm",
  facturada: "bg-nurture/30 text-nurture",
  cobrada: "bg-green-700/30 text-green-400",
  repartida: "bg-gray-700 text-gray-300",
};

export default async function CommissionsPage() {
  const comisiones = await getComisiones();
  const total = comisiones.reduce((s, c) => s + c.monto_estimado, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gold">Comisiones</h1>
      <p className="text-sm text-gray-400">Total en pipeline: {currency(total)}</p>

      {comisiones.length === 0 && (
        <p className="text-sm text-gray-500">
          Sin comisiones registradas todavía. Se cargarán al migrar la Bitácora de Cierre.
        </p>
      )}

      <div className="space-y-2">
        {comisiones.map((c) => (
          <div key={c.id} className="bg-panel border border-line rounded-xl p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.propiedad ?? "Propiedad sin asignar"}</div>
                <div className="text-xs text-gray-400">
                  {c.tipo === "porcentaje" ? `${c.valor}%` : currency(c.valor)}
                  {c.iva_aplica ? " + IVA" : ""}
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full ${estatusColor[c.estatus]}`}>
                {c.estatus}
              </span>
            </div>
            <div className="text-sm font-semibold mt-2">{currency(c.monto_estimado)}</div>
            {c.reparto_asesor && (
              <p className="text-xs text-gray-500">
                Reparto: {c.reparto_asesor} ({c.reparto_porcentaje}%)
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
