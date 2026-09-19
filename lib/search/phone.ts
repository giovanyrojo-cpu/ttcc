import { companyTokens } from "./employers";

export type PhoneStatus =
  | "confirmed"
  | "format_valid"
  | "outside_area"
  | "invalid_format"
  | "missing";

export interface PhoneCheck {
  status: PhoneStatus;
  // Diez dígitos, sin separadores.
  number?: string;
  // URL de la segunda fuente que lo confirma.
  confirmed_by?: string;
  notes: string[];
}

export interface PhoneSource {
  url: string;
  text: string;
}

// LADA de la zona metropolitana de Querétaro (Querétaro, El Marqués, Corregidora).
// La 446 también es de Querétaro (confirmado por Jesús).
export const QUERETARO_AREA_CODES: readonly string[] = ["442", "446"];

// Copias del mismo directorio: no cuentan como segunda fuente.
const NOT_INDEPENDENT = /piq\.com\.mx|studocu\.com|scribd\.com/i;

const PHONE_IN_TEXT =
  /(?:\+?52[\s.-]?)?\(?\d{2,3}\)?[\s.-]?\d{3,4}[\s.-]?\d{4}/g;

function splitNumbers(raw: string): string[] {
  const numbers: string[] = [];

  for (const chunk of raw.split(/[/;,]|\by\b/i)) {
    let digits = chunk.replace(/\D/g, "");

    if (digits === "") continue;

    if (digits.length === 12 && digits.startsWith("52")) {
      digits = digits.slice(2);
    }

    // Dos números pegados sin separador.
    if (digits.length === 20) {
      numbers.push(digits.slice(0, 10), digits.slice(10));
      continue;
    }

    numbers.push(digits);
  }

  return numbers;
}

// El formato solo descarta errores estructurales (faltan o sobran dígitos).
// No detecta un dígito mal leído por el OCR: para eso está la segunda fuente.
export function checkPhoneFormat(raw: string | undefined): PhoneCheck {
  if (!raw || raw.replace(/\D/g, "") === "") {
    return { status: "missing", notes: ["Sin teléfono en la fuente."] };
  }

  const valid = splitNumbers(raw).filter((number) =>
    /^[2-9]\d{9}$/.test(number)
  );

  if (valid.length === 0) {
    return {
      status: "invalid_format",
      notes: [`No es un número de 10 dígitos válido: "${raw}".`],
    };
  }

  const number = valid[0];
  const notes =
    valid.length > 1
      ? [`La fuente lista ${valid.length} números; se usa el primero.`]
      : [];
  const areaCode = number.slice(0, 3);

  if (QUERETARO_AREA_CODES.includes(areaCode)) {
    return {
      status: "format_valid",
      number,
      notes: [...notes, "Formato válido de Querétaro; sin segunda fuente."],
    };
  }

  return {
    status: "outside_area",
    number,
    notes: [
      ...notes,
      `LADA ${areaCode} fuera de Querétaro: revisar si es una oficina en otra ciudad o un error de lectura.`,
    ],
  };
}

export function findPhonesInText(text: string): string[] {
  return (text.match(PHONE_IN_TEXT) ?? [])
    .map((match) => match.replace(/\D/g, "").slice(-10))
    .filter((number) => number.length === 10);
}

// Confirma el teléfono solo si una fuente independiente lo muestra Y
// menciona a la empresa (evita coincidencias con números de otra cosa).
export function confirmPhone(
  check: PhoneCheck,
  companyName: string,
  sources: PhoneSource[]
): PhoneCheck {
  if (!check.number) return check;

  const brand = companyTokens(companyName).find((token) => token.length >= 4);

  for (const source of sources) {
    if (NOT_INDEPENDENT.test(source.url)) continue;

    const text = source.text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

    if (brand && !text.includes(brand)) continue;

    if (findPhonesInText(source.text).includes(check.number)) {
      return {
        ...check,
        status: "confirmed",
        confirmed_by: source.url,
        notes: [...check.notes, "Confirmado en una segunda fuente."],
      };
    }
  }

  return {
    ...check,
    notes: [...check.notes, "No se encontró una segunda fuente."],
  };
}

// Confiable = confirmado, o al menos con formato válido para Querétaro.
export function isReliablePhone(check: PhoneCheck): boolean {
  return check.status === "confirmed" || check.status === "format_valid";
}
