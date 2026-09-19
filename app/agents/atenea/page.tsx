import Link from "next/link";
import { getProperties } from "@/lib/data";
import type { Property } from "@/types/domain";

function money(value: number | null, currency: string) {
  if (value === null) return "Por confirmar";
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

function analyzeProperty(p: Property) {
  const fortalezas: string[] = [];
  const verificar: string[] = [];
  const sectores: string[] = [];

  if (p.superficie_m2) {
    fortalezas.push(`${p.superficie_m2.toLocaleString("es-MX")} m² disponibles`);
  } else {
    verificar.push("Superficie exacta");
  }

  if (p.precio) {
    fortalezas.push(`Precio registrado: ${money(p.precio, p.moneda)}`);
  } else {
    verificar.push("Precio actualizado");
  }

  if (p.kva && p.kva > 0) {
    fortalezas.push(`Capacidad eléctrica registrada: ${p.kva} kVA`);
  } else if (p.tipo === "Industrial") {
    verificar.push("Capacidad eléctrica disponible");
  }

  if (p.anden === true) {
    fortalezas.push("Cuenta con andén");
  } else if (p.tipo === "Industrial") {
    verificar.push("Andén, rampa y condiciones de carga");
  }

  if (p.uso_de_suelo) {
    fortalezas.push(`Uso de suelo registrado: ${p.uso_de_suelo}`);
  } else {
    verificar.push("Uso de suelo vigente");
  }

  if (p.tipo === "Industrial") {
    sectores.push(
      "Manufactura",
      "Logística y distribución",
      "Automotriz y autopartes",
      "Metalmecánica"
    );

    if (p.kva && p.kva >= 150) {
      sectores.push(
        "Plásticos",
        "Procesos con demanda eléctrica relevante"
      );
    }
  }

  if (p.tipo === "Terreno") {
    sectores.push(
      "Desarrolladores",
      "Empresas en expansión",
      "Inversionistas patrimoniales"
    );
  }

  if (p.tipo === "Oficina") {
    sectores.push(
      "Servicios profesionales",
      "Corporativos",
      "Tecnología",
      "Consultoría"
    );
  }

  if (p.tipo === "Residencial") {
    sectores.push(
      "Ejecutivos",
      "Familias",
      "Relocation",
      "Inversionistas"
    );
  }

  const clienteIdeal =
    p.tipo === "Industrial"
      ? "Empresa que necesita capacidad operativa, ubicación estratégica y características técnicas compatibles."
      : p.tipo === "Terreno"
      ? "Empresa, desarrollador o inversionista que busca expansión, desarrollo o reserva estratégica."
      : p.tipo === "Oficina"
      ? "Empresa o profesionista que necesita una ubicación funcional para operación administrativa o comercial."
      : p.tipo === "Residencial"
      ? "Comprador, arrendatario, ejecutivo o familia cuyo presupuesto y ubicación objetivo coincidan con la propiedad."
      : "Prospecto cuya necesidad inmobiliaria coincida con ubicación, precio y características.";

  return {
    fortalezas,
    verificar,
    sectores,
    clienteIdeal,
  };
}

export default async function AteneaPage({
  searchParams,
}: {
  searchParams?: { property?: string };
}) {
  const properties = (await getProperties()).filter((p) => p.activo);

  const selected =
    properties.find((p) => p.id === searchParams?.property) ??
    properties[0] ??
    null;

  const analysis = selected ? analyzeProperty(selected) : null;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/agents" className="text-xs text-gray-500">
          ← Command Center
        </Link>

        <h1 className="text-2xl font-bold text-gold mt-2">
          🦉 ATENEA — MASTER ANALYTICS
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Inteligencia comercial para convertir inventario en oportunidades.
        </p>
      </header>

      <section className="bg-panel border border-line rounded-xl p-5">
        <h2 className="font-bold">Selecciona una propiedad</h2>

        <div className="flex flex-wrap gap-2 mt-4">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/agents/atenea?property=${p.id}`}
              className={`text-xs px-3 py-2 rounded-lg border ${
                selected?.id === p.id
                  ? "border-gold text-gold"
                  : "border-line text-gray-400"
              }`}
            >
              {p.titulo}
            </Link>
          ))}
        </div>
      </section>

      {!selected || !analysis ? (
        <section className="bg-panel border border-line rounded-xl p-5">
          No hay propiedades activas disponibles.
        </section>
      ) : (
        <>
          <section className="bg-panel border border-line rounded-xl p-5">
            <p className="text-xs text-gold">DATOS CONFIRMADOS</p>

            <h2 className="text-xl font-bold mt-1">{selected.titulo}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-500">Tipo</span>
                <p>{selected.tipo}</p>
              </div>

              <div>
                <span className="text-gray-500">Ubicación</span>
                <p>{selected.ubicacion}</p>
              </div>

              <div>
                <span className="text-gray-500">Superficie</span>
                <p>
                  {selected.superficie_m2
                    ? `${selected.superficie_m2.toLocaleString("es-MX")} m²`
                    : "Por confirmar"}
                </p>
              </div>

              <div>
                <span className="text-gray-500">Precio</span>
                <p>{money(selected.precio, selected.moneda)}</p>
              </div>

              <div>
                <span className="text-gray-500">Energía</span>
                <p>{selected.kva ? `${selected.kva} kVA` : "Por confirmar"}</p>
              </div>

              <div>
                <span className="text-gray-500">Uso de suelo</span>
                <p>{selected.uso_de_suelo || "Por confirmar"}</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-panel border border-line rounded-xl p-5">
              <p className="text-xs text-gold">INFERIDO POR ATENEA</p>
              <h2 className="font-bold mt-1">🎯 Cliente ideal</h2>
              <p className="text-sm text-gray-400 mt-3">
                {analysis.clienteIdeal}
              </p>
            </div>

            <div className="bg-panel border border-line rounded-xl p-5">
              <p className="text-xs text-gold">INFERIDO POR ATENEA</p>
              <h2 className="font-bold mt-1">🏭 Sectores objetivo</h2>

              <ul className="text-sm text-gray-400 mt-3 space-y-1">
                {analysis.sectores.map((sector) => (
                  <li key={sector}>• {sector}</li>
                ))}
              </ul>
            </div>

            <div className="bg-panel border border-line rounded-xl p-5">
              <p className="text-xs text-gold">EVIDENCIA DISPONIBLE</p>
              <h2 className="font-bold mt-1">✅ Fortalezas</h2>

              <ul className="text-sm text-gray-400 mt-3 space-y-1">
                {analysis.fortalezas.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-panel border border-line rounded-xl p-5">
              <p className="text-xs text-gold">POR VERIFICAR</p>
              <h2 className="font-bold mt-1">⚠️ Información faltante</h2>

              <ul className="text-sm text-gray-400 mt-3 space-y-1">
                {analysis.verificar.length ? (
                  analysis.verificar.map((item) => (
                    <li key={item}>• {item}</li>
                  ))
                ) : (
                  <li>• Sin faltantes básicos detectados.</li>
                )}
              </ul>
            </div>
          </section>

          <section className="bg-panel border border-gold/40 rounded-xl p-5">
            <p className="text-xs text-gold">SIGUIENTE AGENTE</p>
            <h2 className="text-lg font-bold mt-1">
              💪 Brief para HÉRCULES
            </h2>

            <p className="text-sm text-gray-400 mt-3">
              Buscar prospectos compatibles con {selected.tipo.toLowerCase()} en{" "}
              {selected.ubicacion}, priorizando{" "}
              {analysis.sectores.join(", ")}.
            </p>

            <Link
              href={`/agents/hercules?property=${selected.id}`}
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-gold text-black font-semibold"
            >
              💪 ACTIVAR CACERÍA CON HÉRCULES →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
