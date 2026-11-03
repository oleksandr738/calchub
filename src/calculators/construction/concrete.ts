import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

export const calculator: CalculatorDef = {
  formula: 'L × W × (T ÷ 100) × (1 + z ÷ 100)',
  fields: [
    { id: 'length', type: 'number', placeholder: '6', min: 0 },
    { id: 'width', type: 'number', placeholder: '4', min: 0 },
    { id: 'thickness', type: 'number', placeholder: '15', min: 0 },
    { id: 'reserve', type: 'number', placeholder: '5', min: 0 },
  ],
  outputs: ['withReserve', 'volume'],
  compute({ length, width, thickness, reserve }) {
    const l = length as number;
    const w = width as number;
    const t = thickness as number;
    const z = reserve as number;
    const volume = (l * w * t) / 100;
    const withReserve = volume * (1 + z / 100);
    return done(
      [
        { id: 'withReserve', value: withReserve, unit: 'm3', decimals: 3, primary: true },
        { id: 'volume', value: volume, unit: 'm3', decimals: 3 },
      ],
      ({ fmt }) => `${fmt(l)} × ${fmt(w)} × ${fmt(t)} ÷ 100 × (1 + ${fmt(z)}% ÷ 100) = ${fmt(withReserve)}`,
    );
  },
};
