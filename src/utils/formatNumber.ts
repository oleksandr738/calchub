/** Код мови сайту -> локаль для форматування чисел і дат. */
export const numberLocales: Record<string, string> = {
  uk: 'uk-UA',
  en: 'en-GB',
  sv: 'sv-SE',
};

export function formatNumber(
  value: number,
  locale: string,
  maximumFractionDigits = 6,
  minimumFractionDigits = 0,
): string {
  // Прибирає похибки кшталт 0.30000000000000004
  const clean = Number(value.toPrecision(12));
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits: Math.min(minimumFractionDigits, maximumFractionDigits),
  }).format(clean);
}
