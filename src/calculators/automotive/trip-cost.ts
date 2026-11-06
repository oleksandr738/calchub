import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

export const calculator: CalculatorDef = {
  formula: 'D × c ÷ 100 × p',
  fields: [
    { id: 'trip', type: 'select', options: ['oneWay', 'roundTrip'] },
    { id: 'distance', type: 'number', placeholder: '300', min: 0 },
    { id: 'consumption', type: 'number', placeholder: '7', min: 0 },
    { id: 'price', type: 'number', placeholder: '20', min: 0 },
  ],
  outputs: ['cost', 'fuel', 'totalDistance'],
  compute({ trip, distance, consumption, price }) {
    const total = (distance as number) * (trip === 'roundTrip' ? 2 : 1);
    const c = consumption as number;
    const p = price as number;
    const fuel = (total * c) / 100;
    const cost = fuel * p;
    return done(
      [
        { id: 'cost', value: cost, decimals: 2, fixed: true, primary: true },
        { id: 'fuel', value: fuel, unit: 'L', decimals: 2 },
        { id: 'totalDistance', value: total, unit: 'km', decimals: 2 },
      ],
      ({ fmt }) => `${fmt(total)} × ${fmt(c)} ÷ 100 × ${fmt(p)} = ${fmt(cost)}`,
    );
  },
};
