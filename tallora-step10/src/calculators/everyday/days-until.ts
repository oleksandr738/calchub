import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';
import { countWorkdays, dayNumber, parseDate } from '../dates.ts';

export const calculator: CalculatorDef = {
  fields: [
    { id: 'event', type: 'date' },
    { id: 'from', type: 'date', default: 'today' },
  ],
  outputs: ['days', 'daysAgo', 'weeks', 'workdays'],
  compute({ event, from }) {
    const ev = dayNumber(parseDate(event as string));
    const fr = dayNumber(parseDate(from as string));
    const upcoming = ev >= fr;
    const n = Math.abs(ev - fr);
    // Робочі дні рахуємо від ранішої дати до пізнішої, сама пізніша дата не входить
    const lo = Math.min(ev, fr);

    const count = { decimals: 0, fixed: true };
    return done([
      { id: upcoming ? 'days' : 'daysAgo', value: n, primary: true, ...count },
      { id: 'weeks', value: Math.floor(n / 7), ...count },
      { id: 'workdays', value: countWorkdays(lo, n), ...count },
    ]);
  },
};
