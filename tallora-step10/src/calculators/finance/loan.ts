import type { CalculatorDef } from '../types.ts';
import { done } from '../helpers.ts';

const money = { decimals: 2, fixed: true };

export const calculator: CalculatorDef = {
  formula: 'P × r ÷ (1 − (1 + r)^−n)',
  fields: [
    { id: 'type', type: 'select', options: ['annuity', 'differentiated'] },
    { id: 'amount', type: 'number', placeholder: '100000', min: 0 },
    { id: 'rate', type: 'number', placeholder: '12', min: 0 },
    { id: 'term', type: 'number', placeholder: '5', min: 0 },
    { id: 'termUnit', type: 'select', options: ['years', 'months'] },
  ],
  outputs: ['payment', 'firstPayment', 'lastPayment', 'total', 'overpayment'],
  compute({ type, amount, rate, term, termUnit }) {
    const P = amount as number;
    const annual = rate as number;
    const n = (term as number) * (termUnit === 'years' ? 12 : 1);

    if (annual > 1000) return { ok: false, error: 'outOfRange', field: 'rate' };
    if (n <= 0 || n > 1200) return { ok: false, error: 'outOfRange', field: 'term' };

    const r = annual / 12 / 100; // місячна ставка

    if (type === 'annuity') {
      const payment = r === 0 ? P / n : (P * r) / (1 - (1 + r) ** -n);
      const total = payment * n;
      return done(
        [
          { id: 'payment', value: payment, primary: true, ...money },
          { id: 'total', value: total, ...money },
          { id: 'overpayment', value: total - P, ...money },
        ],
        ({ fmt }) => `${fmt(P)} × ${fmt(r * 100)}% ÷ (1 − (1 + ${fmt(r * 100)}%)^−${fmt(n)}) = ${fmt(payment)}`,
      );
    }

    // Диференційований платіж: рівна частина боргу + відсотки на залишок
    const principalPart = P / n;
    const first = principalPart + P * r;
    const last = principalPart + principalPart * r;
    const interest = P * r * ((n + 1) / 2);
    return done(
      [
        { id: 'firstPayment', value: first, primary: true, ...money },
        { id: 'lastPayment', value: last, ...money },
        { id: 'total', value: P + interest, ...money },
        { id: 'overpayment', value: interest, ...money },
      ],
      ({ fmt }) => `${fmt(P)} ÷ ${fmt(n)} + ${fmt(P)} × ${fmt(r * 100)}% = ${fmt(first)}`,
    );
  },
};
