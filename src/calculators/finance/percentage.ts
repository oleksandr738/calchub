export type PercentageMode =
  | 'percentOf'
  | 'whatPercent'
  | 'change'
  | 'increase'
  | 'decrease';

export type PercentageResult =
  | { ok: true; value: number; unit: 'number' | 'percent' }
  | { ok: false; error: 'divisionByZero' | 'overflow' };

/**
 * Значення a і b залежать від режиму:
 *  percentOf   a = відсоток,          b = число        -> a% від b
 *  whatPercent a = частина,           b = ціле         -> скільки % a від b
 *  change      a = початкове,         b = нове         -> зміна у %
 *  increase    a = число,             b = відсоток     -> a + b%
 *  decrease    a = число,             b = відсоток     -> a − b%
 */
export function calculatePercentage(
  mode: PercentageMode,
  a: number,
  b: number,
): PercentageResult {
  let value: number;
  let unit: 'number' | 'percent' = 'number';

  switch (mode) {
    case 'percentOf':
      value = (a * b) / 100;
      break;
    case 'whatPercent':
      if (b === 0) return { ok: false, error: 'divisionByZero' };
      value = (a / b) * 100;
      unit = 'percent';
      break;
    case 'change':
      if (a === 0) return { ok: false, error: 'divisionByZero' };
      value = ((b - a) / Math.abs(a)) * 100;
      unit = 'percent';
      break;
    case 'increase':
      value = a * (1 + b / 100);
      break;
    case 'decrease':
      value = a * (1 - b / 100);
      break;
  }

  if (!Number.isFinite(value)) return { ok: false, error: 'overflow' };
  // Прибираємо похибки плаваючої крапки (0.1 * 3 = 0.30000000000000004)
  return { ok: true, value: Number(value.toPrecision(12)), unit };
}
