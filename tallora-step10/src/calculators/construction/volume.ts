import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

const toMeters: Record<string, number> = { m: 1, cm: 0.01, mm: 0.001, ft: 0.3048 };

export const calculator: CalculatorDef = {
  formula: 'a × b × h  |  π × r² × h  |  4/3 × π × r³',
  fields: [
    { id: 'shape', type: 'select', options: ['box', 'cylinder', 'sphere'] },
    { id: 'unit', type: 'select', options: ['m', 'cm', 'mm', 'ft'] },
    { id: 'length', type: 'number', placeholder: '5', min: 0, showWhen: { field: 'shape', values: ['box'] } },
    { id: 'width', type: 'number', placeholder: '3', min: 0, showWhen: { field: 'shape', values: ['box'] } },
    { id: 'height', type: 'number', placeholder: '1.5', min: 0, showWhen: { field: 'shape', values: ['box', 'cylinder'] } },
    { id: 'radius', type: 'number', placeholder: '0.5', min: 0, showWhen: { field: 'shape', values: ['cylinder', 'sphere'] } },
  ],
  outputs: ['volume', 'liters'],
  compute(v) {
    const unit = v.unit as string;
    let volume: number;
    let steps: (fmt: (n: number) => string, res: string) => string;

    if (v.shape === 'box') {
      const l = v.length as number;
      const w = v.width as number;
      const h = v.height as number;
      volume = l * w * h;
      steps = (f, res) => `${f(l)} × ${f(w)} × ${f(h)} = ${res}`;
    } else if (v.shape === 'cylinder') {
      const r = v.radius as number;
      const h = v.height as number;
      volume = Math.PI * r * r * h;
      steps = (f, res) => `π × ${f(r)}² × ${f(h)} = ${res}`;
    } else {
      const r = v.radius as number;
      volume = (4 / 3) * Math.PI * r ** 3;
      steps = (f, res) => `4/3 × π × ${f(r)}³ = ${res}`;
    }

    const liters = volume * toMeters[unit]! ** 3 * 1000;
    return done(
      [
        { id: 'volume', value: volume, unit: `${unit}3`, primary: true },
        { id: 'liters', value: liters, unit: 'L' },
      ],
      ({ fmt, unit: u }) => steps(fmt, `${fmt(volume)} ${u(`${unit}3`)}`),
    );
  },
};
