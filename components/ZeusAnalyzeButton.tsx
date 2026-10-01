"use client";

import { useState } from "react";
import type { Property } from "@/types/domain";

type Props = {
  property: Property;
};

type ZeusResult = {
  status?: string;
  model?: string;
  analysis?: {
    opportunityScore?: number;
    scoreRationale?: string;
    clienteIdeal?: string[];
    argumentoPrincipal?: string;
    atenea?: {
      confirmado?: string[];
      inferencias?: string[];
      porVerificar?: string[];
    };
    hermes?: {
      whatsapp?: string;
    };
    moneyEngine?: {
      prioridad?: string;
      oportunidadMonetizable?: string;
      riesgos?: string[];
    };
    accionesHoy?: Array<{
      accion?: string;
      responsable?: string;
      kpi?: string;
    }>;
  };
  error?: string;
};

export default function ZeusAnalyzeButton({ property }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ZeusResult | null>(null);

  async function analyze() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/zeus/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ property }),
      });

      const data = (await response.json()) as ZeusResult;

      setResult(data);
    } catch {
      setResult({
        error: "No fue posible conectar con ZEUS.",
      });
    } finally {
      setLoading(false);
    }
  }

  const analysis = result?.analysis;

  return (
    <div className="mt-3 border-t border-line pt-3">
      <button
        type="button"
        onClick={analyze}
        disabled={loading}
        className="rounded-lg bg-gold px-3 py-2 text-xs font-bold text-black disabled:opacity-60"
      >
        {loading ? "ZEUS analizando..." : "⚡ Analizar con TTP AI"}
      </button>

      {result?.error && (
        <p className="mt-2 text-xs text-red-400">
          {result.error}
        </p>
      )}

      {analysis && (
        <div className="mt-3 space-y-3 rounded-xl border border-gold/30 bg-black/20 p-3 text-xs">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                ZEUS · Opportunity Score
              </div>

              <div className="text-2xl font-bold text-gold">
                {analysis.opportunityScore ?? "—"}/100
              </div>
            </div>

            <div className="text-right text-gray-400">
              Prioridad {analysis.moneyEngine?.prioridad ?? "—"}
            </div>
          </div>

          {analysis.scoreRationale && (
            <div>
              <div className="font-semibold text-gray-300">
                Motivo del score
              </div>

              <p className="text-gray-400">
                {analysis.scoreRationale}
              </p>
            </div>
          )}

          {analysis.argumentoPrincipal && (
            <div>
              <div className="font-semibold text-gray-300">
                Argumento principal
              </div>

              <p className="text-gray-400">
                {analysis.argumentoPrincipal}
              </p>
            </div>
          )}

          {!!analysis.clienteIdeal?.length && (
            <div>
              <div className="font-semibold text-gray-300">
                Cliente ideal
              </div>

              <p className="text-gray-400">
                {analysis.clienteIdeal.join(" · ")}
              </p>
            </div>
          )}

          {!!analysis.atenea?.porVerificar?.length && (
            <div>
              <div className="font-semibold text-gray-300">
                ATENEA · Por verificar
              </div>

              <ul className="list-disc space-y-1 pl-4 text-gray-400">
                {analysis.atenea.porVerificar.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {analysis.hermes?.whatsapp && (
            <div>
              <div className="font-semibold text-gray-300">
                HERMES · WhatsApp
              </div>

              <p className="whitespace-pre-wrap text-gray-400">
                {analysis.hermes.whatsapp}
              </p>
            </div>
          )}

          {analysis.moneyEngine?.oportunidadMonetizable && (
            <div>
              <div className="font-semibold text-gray-300">
                Money Engine
              </div>

              <p className="text-gray-400">
                {analysis.moneyEngine.oportunidadMonetizable}
              </p>
            </div>
          )}

          {!!analysis.accionesHoy?.length && (
            <div>
              <div className="font-semibold text-gray-300">
                ZEUS · 3 acciones de hoy
              </div>

              <div className="mt-1 space-y-2">
                {analysis.accionesHoy.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-line p-2"
                    >
                      <div>
                        {index + 1}. {item.accion}
                      </div>

                      <div className="text-gray-500">
                        {item.responsable ||
                          "Responsable por definir"}

                        {item.kpi
                          ? ` · KPI: ${item.kpi}`
                          : ""}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="text-[10px] text-gray-600">
            Modelo: {result?.model ?? "OpenAI"}
          </div>
        </div>
      )}
    </div>
  );
}
