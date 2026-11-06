import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

export const calculator: CalculatorDef = {
  formula: 'F ÷ D × 100',
  fields: [
    { id: 'distance', type: 'number', placeholder: '450', min: 0 },
    { id: 'fuel', type: 'number', placeholder: '31.5', min: 0 },
  ],
  outputs: ['consumption', 'consumptionMil', 'kmPerLiter'],
  compute({ distance, fuel }) {
    const d = distance as number;
    const f = fuel as number;
    if (d === 0) return { ok: false, error: 'divisionByZero', field: 'distance' };
    if (f === 0) return { ok: false, error: 'outOfRange', field: 'fuel' };
    const per100 = (f / d) * 100;
    return done(
      [
        { id: 'consumption', value: per100, unit: 'L100', decimals: 2, primary: true },
        { id: 'consumptionMil', value: per100 / 10, unit: 'L10', decimals: 2 },
        { id: 'kmPerLiter', value: d / f, unit: 'kmL', decimals: 2 },
      ],
      ({ fmt }) => `${fmt(f)} ÷ ${fmt(d)} × 100 = ${fmt(per100)}`,
    );
  },
};
