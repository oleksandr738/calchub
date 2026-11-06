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

export type ParsedDate =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'ok'; value: string };

const monthDays = (y: number, m: number): number =>
  [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]!;

/**
 * Перевіряє дату з поля <input type="date"> (YYYY-MM-DD).
 * Роки поза 1–9999 і неіснуючі дати (31 лютого) вважаються некоректними.
 */
export function parseISODate(input: string): ParsedDate {
  const s = input.trim();
  if (s === '') return { status: 'empty' };
  const m = /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return { status: 'invalid' };
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 1 || y > 9999 || mo < 1 || mo > 12 || d < 1 || d > monthDays(y, mo)) {
    return { status: 'invalid' };
  }
  return { status: 'ok', value: `${String(y).padStart(4, '0')}-${m[2]}-${m[3]}` };
}
