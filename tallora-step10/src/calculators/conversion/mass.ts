import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';
import { convert, massToKg } from '../units.ts';

const options = ['t', 'kg', 'g', 'mg', 'lb', 'oz'];

export const calculator: CalculatorDef = {
  fields: [
    { id: 'value', type: 'number', placeholder: '10', min: 0 },
    { id: 'from', type: 'select', options, default: 'kg' },
    { id: 'to', type: 'select', options, default: 'lb' },
  ],
  outputs: ['result'],
  compute({ value, from, to }) {
    const v = value as number;
    const f = from as string;
    const t = to as string;
    const r = convert(massToKg, v, f, t);
    return done([{ id: 'result', value: r, unit: t, primary: true }], ({ fmt, unit }) =>
      `${fmt(v)} ${unit(f)} = ${fmt(r)} ${unit(t)}  (1 ${unit(f)} = ${fmt(convert(massToKg, 1, f, t))} ${unit(t)})`,
    );
  },
};
