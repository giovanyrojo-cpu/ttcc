import Link from "next/link";
import { getLeads, getProperties } from "@/lib/data";
import { createHuntBrief } from "@/lib/agents/atenea";
import { qualifyProspect } from "@/lib/agents/hercules";
import { createHuntPreview } from "@/lib/hunts/preview";
import { searchProspects } from "@/lib/search";
import { firecrawlProspectProvider } from "@/lib/search/firecrawl";
import ExportExcelButton from "./ExportExcelButton";

export default async function HerculesPage({
  searchParams,
}: {
  searchParams?: { property?: string; execute?: string };
}) {
  const leads = await getLeads();
  const properties = (await getProperties()).filter((p) => p.activo);

  const selected =
    properties.find((p) => p.id === searchParams?.property) ??
    properties[0] ??
    null;

  const huntBrief = selected
    ? createHuntBrief(selected)
    : null;

  const rawProspects =
    searchParams?.execute === "1" && selected && huntBrief
      ? await searchProspects({
          property_id: selected.id,
          property_title: selected.titulo,
          geography: huntBrief.hunt_order.geography,
          target_sectors: huntBrief.hunt_order.target_sectors,
          target_roles: huntBrief.hunt_order.target_roles,
          buying_signals: huntBrief.hunt_order.buying_signals,
          limit: 50,
        }, [firecrawlProspectProvider])
      : [];

  const huntResults =
    searchParams?.execute === "1" && selected && huntBrief
      ? rawProspects
          .map((prospect) => qualifyProspect(prospect, huntBrief))
          .sort((a, b) => b.fit_score - a.fit_score)
      : [];

  const priorityA = leads.filter((lead) => lead.prioridad === "A");
  const priorityB = leads.filter((lead) => lead.prioridad === "B");

  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs text-gray-500 uppercase">
          TTP Agentic Real Estate OS™
        </p>

        <h1 className="text-2xl font-bold text-gold">
          💪 HÉRCULES — HUNTER
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Prospección, investigación, calificación y priorización comercial.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Leads CRM" value={leads.length} />
        <Metric label="Prioridad A" value={priorityA.length} />
        <Metric label="Prioridad B" value={priorityB.length} />
        <Metric
          label="Por trabajar"
          value={leads.filter((l) => l.estatus_crm === "Nuevo").length}
        />
      </section>

      <section className="bg-panel border border-line rounded-xl p-5">
        <p className="text-xs text-gold uppercase mb-2">
          Flujo Agentic
        </p>

        <h2 className="font-bold text-lg">
          ATENEA → HÉRCULES
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          ATENEA define el cliente ideal, sectores, geografía,
          decisores y señales de compra. HÉRCULES convierte esa
          inteligencia en prospectos calificados.
        </p>

        <div className="mt-4">
          <Link
            href="/agents/atenea"
            className="inline-block border border-gold text-gold rounded-lg px-4 py-2 text-sm"
          >
            ← Ir a ATENEA
          </Link>
        </div>
      </section>

      <section className="bg-panel border border-line rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-gold uppercase">
              Radar comercial
            </p>

            <h2 className="font-bold text-lg">
              Prospectos prioritarios
            </h2>
          </div>

          <span className="text-xs text-gray-500">
            Score → Prioridad → Acción
          </span>
        </div>

        {priorityA.length === 0 ? (
          <div className="border border-line rounded-xl p-5">
            <p className="font-semibold">
              Todavía no hay prospectos A.
            </p>

            <p className="text-sm text-gray-400 mt-1">
              La siguiente conexión permitirá recibir órdenes
              directamente desde ATENEA.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {priorityA.slice(0, 10).map((lead) => (
              <div
                key={lead.id}
                className="border border-hot/40 rounded-xl p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {lead.empresa_o_persona}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {lead.estatus_crm}
                    </p>
                  </div>

                  <span className="text-gold font-bold">
                    A
                  </span>
                </div>

                <p className="text-sm text-gray-400 mt-3">
                  {lead.next_best_action ||
                    "Investigar y preparar siguiente acción"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-gold/50 rounded-xl p-5">
        <p className="text-xs text-gold uppercase">
          Orden activa de ATENEA
        </p>

        {huntBrief ? (
          <div className="mt-3 space-y-4">
            <div>
              <p className="font-bold text-lg">
                🔎 ORDEN DE CACERÍA
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {huntBrief.hunt_order.objective}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Propiedad</p>
                <p className="font-semibold">{selected?.titulo}</p>
              </div>

              <div>
                <p className="text-gray-500">Geografía</p>
                <p>{huntBrief.hunt_order.geography.join(" · ")}</p>
              </div>

              <div>
                <p className="text-gray-500">Sectores objetivo</p>
                <p>{huntBrief.hunt_order.target_sectors.join(" · ")}</p>
              </div>

              <div>
                <p className="text-gray-500">Score mínimo</p>
                <p className="font-bold text-gold">
                  {huntBrief.hunt_order.minimum_fit_score}/100
                </p>
              </div>

              <div>
                <p className="text-gray-500">Decisores</p>
                <p>{huntBrief.hunt_order.target_roles.join(" · ")}</p>
              </div>

              <div>
                <p className="text-gray-500">Señales de compra</p>
                <p>{huntBrief.hunt_order.buying_signals.join(" · ")}</p>
              </div>
            </div>

            <a
                href={selected ? `/agents/hercules?property=${selected.id}&execute=1` : "/agents/hercules"}
                className="inline-block bg-gold text-black font-bold rounded-lg px-5 py-3"
              >
                🔎 EJECUTAR CACERÍA
              </a>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">
            Selecciona una propiedad desde ATENEA.
          </p>
        )}
      </section>

      {searchParams?.execute === "1" && huntBrief && (
        <section className="bg-panel border border-gold/50 rounded-xl p-5">
          <p className="text-xs text-gold uppercase">
            Resultado de HÉRCULES
          </p>

          <h2 className="font-bold text-xl mt-2">
            🔎 CACERÍA EJECUTADA
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            {huntResults.length} candidatos analizados y ordenados por compatibilidad.
          </p>

          <ExportExcelButton prospects={huntResults} />

          <div className="mt-4 space-y-3">
            {huntResults.map((result, index) => (
              <div
                key={`${result.company_or_person}-${index}`}
                className="border border-line rounded-xl p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {result.company_or_person}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      {result.industry || "Industria por investigar"}
                      {" · "}
                      {result.location || "Ubicación por investigar"}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      {result.next_best_action}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gold">
                      {result.fit_score}/100
                    </p>
                    <p className="text-xs text-gray-400">
                      {result.priority}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-panel border border-line rounded-xl p-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}
