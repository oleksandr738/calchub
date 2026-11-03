import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';
import { dayNumber, isLeap, parseDate, ymdDiff, type YMD } from '../dates.ts';

/** День народження в заданому році; 29 лютого в невисокосні роки вважаємо 1 березня. */
function birthdayIn(year: number, b: YMD): number {
  if (b.m === 2 && b.d === 29 && !isLeap(year)) return dayNumber({ y: year, m: 3, d: 1 });
  return dayNumber({ y: year, m: b.m, d: b.d });
}

export const calculator: CalculatorDef = {
  fields: [
    { id: 'birth', type: 'date' },
    { id: 'asOf', type: 'date', default: 'today' },
  ],
  outputs: ['years', 'months', 'days', 'totalDays', 'daysToBirthday'],
  compute({ birth, asOf }) {
    const b = parseDate(birth as string);
    const a = parseDate(asOf as string);
    const today = dayNumber(a);
    if (dayNumber(b) > today) return { ok: false, error: 'dateOrder', field: 'birth' };

    const { years, months, days } = ymdDiff(b, a);
    let next = birthdayIn(a.y, b);
    if (next < today) next = birthdayIn(a.y + 1, b);

    const count = { decimals: 0, fixed: true };
    return done([
      { id: 'years', value: years, primary: true, ...count },
      { id: 'months', value: months, ...count },
      { id: 'days', value: days, ...count },
      { id: 'totalDays', value: today - dayNumber(b), ...count },
      { id: 'daysToBirthday', value: next - today, ...count },
    ]);
  },
};
