import Link from "next/link";
import { getProperties } from "@/lib/data";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gold">Propiedades</h1>
      <div className="space-y-2">
        {properties.map((p) => (
          <Link
              key={p.id}
              href={`/agents/atenea?property=${p.id}`}
              className="block bg-panel border border-line rounded-xl p-3 hover:border-gold/60 transition-colors"
            >
            <div className="flex justify-between">
              <div className="font-semibold">{p.titulo}</div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-line text-gray-300">
                {p.tipo}
              </span>
            </div>
            <div className="text-xs text-gray-400">{p.ubicacion}</div>
            <div className="text-xs text-gray-500 mt-1">
              {p.superficie_m2 ? `${p.superficie_m2} m²` : ""}
              {p.kva ? ` · ${p.kva} kVA` : ""}
              {p.anden ? " · Andén" : ""}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
