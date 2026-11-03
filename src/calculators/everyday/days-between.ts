import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';
import { countWorkdays, dayNumber, parseDate } from '../dates.ts';

export const calculator: CalculatorDef = {
  fields: [
    { id: 'start', type: 'date' },
    { id: 'end', type: 'date' },
    { id: 'includeEnd', type: 'select', options: ['no', 'yes'] },
  ],
  outputs: ['days', 'weeks', 'rest', 'workdays'],
  compute({ start, end, includeEnd }) {
    const s = dayNumber(parseDate(start as string));
    const e = dayNumber(parseDate(end as string));
    const lo = Math.min(s, e);
    const n = Math.abs(e - s) + (includeEnd === 'yes' ? 1 : 0);

    const count = { decimals: 0, fixed: true };
    return done([
      { id: 'days', value: n, primary: true, ...count },
      { id: 'weeks', value: Math.floor(n / 7), ...count },
      { id: 'rest', value: n % 7, ...count },
      { id: 'workdays', value: countWorkdays(lo, n), ...count },
    ]);
  },
};
