import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

export const calculator: CalculatorDef = {
  formula: 'ПДВ = N × r ÷ 100  |  N = G ÷ (1 + r ÷ 100)',
  fields: [
    { id: 'mode', type: 'select', options: ['add', 'extract'] },
    { id: 'amount', type: 'number', placeholder: '1000', min: 0 },
    { id: 'rate', type: 'number', placeholder: '25', min: 0 },
  ],
  outputs: ['vat', 'net', 'gross'],
  compute({ mode, amount, rate }) {
    const a = amount as number;
    const r = rate as number;
    let net: number;
    let gross: number;
    if (mode === 'add') {
      net = a;
      gross = a * (1 + r / 100);
    } else {
      gross = a;
      net = a / (1 + r / 100);
    }
    const money = { decimals: 2, fixed: true };
    return done(
      [
        { id: 'vat', value: gross - net, primary: true, ...money },
        { id: 'net', value: net, ...money },
        { id: 'gross', value: gross, ...money },
      ],
      ({ fmt }) =>
        mode === 'add'
          ? `${fmt(a)} × ${fmt(r)}% ÷ 100 = ${fmt(gross - net)}`
          : `${fmt(a)} − ${fmt(a)} ÷ (1 + ${fmt(r)}% ÷ 100) = ${fmt(gross - net)}`,
    );
  },
};
