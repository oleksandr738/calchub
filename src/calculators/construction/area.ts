import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

const toMeters: Record<string, number> = { m: 1, cm: 0.01, mm: 0.001, ft: 0.3048 };

export const calculator: CalculatorDef = {
  formula: 'a × b  |  a × h ÷ 2  |  π × r²',
  fields: [
    { id: 'shape', type: 'select', options: ['rectangle', 'triangle', 'circle'] },
    { id: 'unit', type: 'select', options: ['m', 'cm', 'mm', 'ft'] },
    { id: 'length', type: 'number', placeholder: '4', min: 0, showWhen: { field: 'shape', values: ['rectangle'] } },
    { id: 'width', type: 'number', placeholder: '3', min: 0, showWhen: { field: 'shape', values: ['rectangle'] } },
    { id: 'base', type: 'number', placeholder: '6', min: 0, showWhen: { field: 'shape', values: ['triangle'] } },
    { id: 'height', type: 'number', placeholder: '4', min: 0, showWhen: { field: 'shape', values: ['triangle'] } },
    { id: 'radius', type: 'number', placeholder: '2', min: 0, showWhen: { field: 'shape', values: ['circle'] } },
  ],
  outputs: ['area', 'areaM2'],
  compute(v) {
    const unit = v.unit as string;
    let area: number;
    let steps: (fmt: (n: number) => string, res: string) => string;

    if (v.shape === 'rectangle') {
      const l = v.length as number;
      const w = v.width as number;
      area = l * w;
      steps = (f, res) => `${f(l)} × ${f(w)} = ${res}`;
    } else if (v.shape === 'triangle') {
      const b = v.base as number;
      const h = v.height as number;
      area = (b * h) / 2;
      steps = (f, res) => `${f(b)} × ${f(h)} ÷ 2 = ${res}`;
    } else {
      const r = v.radius as number;
      area = Math.PI * r * r;
      steps = (f, res) => `π × ${f(r)}² = ${res}`;
    }

    const outputs = [{ id: 'area', value: area, unit: `${unit}2`, primary: true }];
    if (unit !== 'm') {
      outputs.push({ id: 'areaM2', value: area * toMeters[unit]! ** 2, unit: 'm2', primary: false });
    }
    return done(outputs, ({ fmt, unit: u }) => steps(fmt, `${fmt(area)} ${u(`${unit}2`)}`));
  },
};
