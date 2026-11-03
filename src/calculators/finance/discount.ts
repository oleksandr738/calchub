import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

export const calculator: CalculatorDef = {
  formula: 'P × (1 − d ÷ 100)',
  fields: [
    { id: 'price', type: 'number', placeholder: '1200', min: 0 },
    { id: 'discount', type: 'number', placeholder: '25', min: 0 },
  ],
  outputs: ['finalPrice', 'saved'],
  compute({ price, discount }) {
    const p = price as number;
    const d = discount as number;
    if (d > 100) return { ok: false, error: 'outOfRange', field: 'discount' };
    const final = p * (1 - d / 100);
    return done(
      [
        { id: 'finalPrice', value: final, decimals: 2, fixed: true, primary: true },
        { id: 'saved', value: p - final, decimals: 2, fixed: true },
      ],
      ({ fmt }) => `${fmt(p)} × (1 − ${fmt(d)}% ÷ 100) = ${fmt(final)}`,
    );
  },
};
