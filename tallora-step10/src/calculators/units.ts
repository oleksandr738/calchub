/** Коефіцієнти переведення в базову одиницю (метр / кілограм). */
export const lengthToMeters: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

export const massToKg: Record<string, number> = {
  mg: 0.000001,
  g: 0.001,
  kg: 1,
  t: 1000,
  oz: 0.028349523125,
  lb: 0.45359237,
};

export function convert(
  table: Record<string, number>,
  value: number,
  from: string,
  to: string,
): number {
  return (value * table[from]!) / table[to]!;
}
