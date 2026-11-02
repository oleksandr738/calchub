export type ParsedNumber =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'ok'; value: number };

/**
 * Перетворює текст з поля введення на число.
 * Приймає крапку або кому як десятковий роздільник, ігнорує пробіли.
 */
export function parseNumber(input: string): ParsedNumber {
  const cleaned = input.replace(/[\s\u00A0\u202F]/g, '').replace(',', '.');
  if (cleaned === '') return { status: 'empty' };
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return { status: 'invalid' };
  const value = Number(cleaned);
  return Number.isFinite(value) ? { status: 'ok', value } : { status: 'invalid' };
}
