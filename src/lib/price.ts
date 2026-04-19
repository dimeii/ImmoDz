export function pricePerSqm(
  price: number,
  surface: number | null | undefined
): number | null {
  if (!surface || surface <= 0) return null;
  return Math.round(price / surface);
}

export function formatPricePerSqm(n: number | null): string | null {
  if (n == null) return null;
  return `${n.toLocaleString("fr-DZ")} DA/m²`;
}
