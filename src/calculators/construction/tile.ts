import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

/** Округлення вгору без хибного +1 через похибку плаваючої крапки */
const ceilClean = (x: number) => Math.ceil(Number(x.toPrecision(12)));

export const calculator: CalculatorDef = {
  formula: 'S ÷ (a × b) × (1 + z ÷ 100)',
  fields: [
    { id: 'length', type: 'number', placeholder: '4', min: 0 },
    { id: 'width', type: 'number', placeholder: '3', min: 0 },
    { id: 'tileLength', type: 'number', placeholder: '30', min: 0 },
    { id: 'tileWidth', type: 'number', placeholder: '30', min: 0 },
    { id: 'reserve', type: 'number', placeholder: '10', min: 0 },
  ],
  outputs: ['tiles', 'tilesExact', 'area'],
  compute({ length, width, tileLength, tileWidth, reserve }) {
    const l = length as number;
    const w = width as number;
    const tl = tileLength as number;
    const tw = tileWidth as number;
    const z = reserve as number;
    if (tl === 0) return { ok: false, error: 'divisionByZero', field: 'tileLength' };
    if (tw === 0) return { ok: false, error: 'divisionByZero', field: 'tileWidth' };

    const area = l * w; // м²
    const exact = (area * 10000) / (tl * tw); // площа в см² ÷ площа плитки в см²
    const tilesExact = ceilClean(exact);
    const tiles = ceilClean(exact * (1 + z / 100));
    return done(
      [
        { id: 'tiles', value: tiles, decimals: 0, fixed: true, primary: true },
        { id: 'tilesExact', value: tilesExact, decimals: 0, fixed: true },
        { id: 'area', value: area, unit: 'm2', decimals: 2 },
      ],
      ({ fmt, unit }) =>
        `${fmt(area)} ${unit('m2')} ÷ (${fmt(tl)} × ${fmt(tw)} ${unit('cm')}) × (1 + ${fmt(z)}% ÷ 100) = ${fmt(exact * (1 + z / 100))} → ${fmt(tiles)}`,
    );
  },
};
