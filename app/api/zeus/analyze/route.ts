import { NextResponse } from "next/server";
import type { Property } from "@/types/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ZeusRequest = {
  property: Property;
};

function extractJson(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("ZEUS no devolvió JSON válido.");
    }

    return JSON.parse(match[0]);
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY no está disponible en el servidor. Revisa Vercel.",
      },
      { status: 503 }
    );
  }

  let body: ZeusRequest;

  try {
    body = (await request.json()) as ZeusRequest;
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400 }
    );
  }

  const property = body?.property;

  if (!property?.id || !property?.titulo || !property?.ubicacion) {
    return NextResponse.json(
      { error: "Faltan datos mínimos de la propiedad." },
      { status: 400 }
    );
  }

  const instructions = `
Eres ZEUS, orquestador del Sistema TTP de Top Ten Property en Querétaro, México.

Tu función es analizar una propiedad y coordinar:
ATENEA, HÉRCULES, HERMES y TTP MONEY ENGINE.

REGLAS:
- No inventes datos.
- No inventes empresas, teléfonos, precios, características ni necesidades.
- Trabaja únicamente con la información recibida.
- Distingue siempre CONFIRMADO, INFERENCIA y POR_VERIFICAR.
- El Opportunity Score es una estimación comercial, no una certeza.

ATENEA:
Analiza datos, fortalezas, restricciones y vacíos.

HÉRCULES:
Analiza cinco lecturas:
1. Usuario final
2. Inversión
3. Expansión
4. Reconversión
5. Pieza estratégica

HERMES:
Genera mensaje WhatsApp y seguimiento días 1, 3 y 7.

TTP MONEY ENGINE:
Prioriza la oportunidad comercial.

ZEUS:
Define las 3 siguientes acciones, responsable y KPI.

Devuelve EXCLUSIVAMENTE JSON válido con esta estructura:

{
  "opportunityScore": 0,
  "scoreRationale": "",
  "clienteIdeal": [],
  "argumentoPrincipal": "",
  "atenea": {
    "confirmado": [],
    "inferencias": [],
    "porVerificar": []
  },
  "hercules": {
    "lecturas": [
      {
        "tipo": "usuario_final",
        "encaje": "",
        "perfilesObjetivo": []
      },
      {
        "tipo": "inversion",
        "encaje": "",
        "perfilesObjetivo": []
      },
      {
        "tipo": "expansion",
        "encaje": "",
        "perfilesObjetivo": []
      },
      {
        "tipo": "reconversion",
        "encaje": "",
        "perfilesObjetivo": []
      },
      {
        "tipo": "pieza_estrategica",
        "encaje": "",
        "perfilesObjetivo": []
      }
    ]
  },
  "hermes": {
    "whatsapp": "",
    "followUpDia1": "",
    "followUpDia3": "",
    "followUpDia7": ""
  },
  "moneyEngine": {
    "prioridad": "A",
    "oportunidadMonetizable": "",
    "riesgos": []
  },
  "accionesHoy": [
    {
      "accion": "",
      "responsable": "",
      "kpi": ""
    }
  ]
}
`;

  const input = `
PROPIEDAD TTP:

${JSON.stringify(property, null, 2)}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        instructions,
        input,
        reasoning: {
          effort: "low",
        },
        max_output_tokens: 3500,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI ZEUS error:", {
        status: response.status,
        type: data?.error?.type,
        code: data?.error?.code,
      });

      return NextResponse.json(
        {
          error:
            "ZEUS no pudo completar el análisis con OpenAI.",
        },
        { status: 502 }
      );
    }

    const outputText =
      data?.output_text ??
      data?.output
        ?.flatMap((item: any) => item?.content ?? [])
        ?.find((item: any) => item?.type === "output_text")
        ?.text;

    if (!outputText) {
      return NextResponse.json(
        {
          error:
            "ZEUS recibió una respuesta vacía.",
        },
        { status: 502 }
      );
    }

    const analysis = extractJson(outputText);

    return NextResponse.json({
      status: "EJECUTADO",
      provider: "openai",
      model: data?.model ?? "gpt-5.6-luna",
      analysis,
    });
  } catch (error) {
    console.error("ZEUS route error:", error);

    return NextResponse.json(
      {
        error:
          "Error interno al ejecutar ZEUS.",
      },
      { status: 500 }
    );
  }
}
