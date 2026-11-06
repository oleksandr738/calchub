import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';
import { convert, lengthToMeters } from '../units.ts';

const options = ['km', 'm', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'];

export const calculator: CalculatorDef = {
  fields: [
    { id: 'value', type: 'number', placeholder: '5', min: 0 },
    { id: 'from', type: 'select', options, default: 'km' },
    { id: 'to', type: 'select', options, default: 'mi' },
  ],
  outputs: ['result'],
  compute({ value, from, to }) {
    const v = value as number;
    const f = from as string;
    const t = to as string;
    const r = convert(lengthToMeters, v, f, t);
    return done([{ id: 'result', value: r, unit: t, primary: true }], ({ fmt, unit }) =>
      `${fmt(v)} ${unit(f)} = ${fmt(r)} ${unit(t)}  (1 ${unit(f)} = ${fmt(convert(lengthToMeters, 1, f, t))} ${unit(t)})`,
    );
  },
};
