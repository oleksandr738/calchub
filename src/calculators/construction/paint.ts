import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

const canSizes: Record<string, number> = { l1: 1, l2_5: 2.5, l5: 5, l10: 10 };
const ceilClean = (x: number) => Math.ceil(Number(x.toPrecision(12)));

export const calculator: CalculatorDef = {
  formula: 'S × k ÷ c',
  fields: [
    { id: 'area', type: 'number', placeholder: '40', min: 0 },
    { id: 'coats', type: 'number', placeholder: '2', min: 0 },
    { id: 'coverage', type: 'number', placeholder: '10', min: 0 },
    { id: 'can', type: 'select', options: ['l1', 'l2_5', 'l5', 'l10'], default: 'l5' },
  ],
  outputs: ['liters', 'cans'],
  compute({ area, coats, coverage, can }) {
    const s = area as number;
    const k = coats as number;
    const c = coverage as number;
    if (k < 1) return { ok: false, error: 'outOfRange', field: 'coats' };
    if (c === 0) return { ok: false, error: 'divisionByZero', field: 'coverage' };

    const liters = (s * k) / c;
    const cans = ceilClean(liters / canSizes[can as string]!);
    return done(
      [
        { id: 'liters', value: liters, unit: 'L', decimals: 2, primary: true },
        { id: 'cans', value: cans, decimals: 0, fixed: true },
      ],
      ({ fmt }) => `${fmt(s)} × ${fmt(k)} ÷ ${fmt(c)} = ${fmt(liters)}`,
    );
  },
};
