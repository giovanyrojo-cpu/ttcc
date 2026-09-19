function tokens(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

// Una señal de compra es "eco" de la búsqueda si todas sus palabras ya
// estaban en la consulta: el buscador la trajo por eso, no porque la
// empresa la haya mostrado.
function isQueryEcho(signal: string, queryTokens: Set<string>) {
  const signalTokens = tokens(signal);

  return (
    signalTokens.length > 0 &&
    signalTokens.every((token) => queryTokens.has(token))
  );
}

// Señales de compra que aparecen en el texto y que NO son eco de la consulta.
// Si devuelve vacío, el texto no es evidencia de intención.
export function realBuyingSignals(
  text: string | undefined,
  buyingSignals: string[],
  query: string
): string[] {
  if (!text) return [];

  const queryTokens = new Set(tokens(query));
  const normalizedText = tokens(text).join(" ");

  return buyingSignals.filter((signal) => {
    if (isQueryEcho(signal, queryTokens)) return false;

    const signalTokens = tokens(signal).join(" ");

    return signalTokens !== "" && normalizedText.includes(signalTokens);
  });
}
