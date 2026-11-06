import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculator as discount } from '../src/calculators/finance/discount.ts';
import { calculator as vat } from '../src/calculators/finance/vat.ts';
import { calculator as area } from '../src/calculators/construction/area.ts';
import { calculator as volume } from '../src/calculators/construction/volume.ts';
import { calculator as length } from '../src/calculators/conversion/length.ts';
import { calculator as mass } from '../src/calculators/conversion/mass.ts';
import { calculator as fuel } from '../src/calculators/automotive/fuel-consumption.ts';
import { calculator as trip } from '../src/calculators/automotive/trip-cost.ts';
import { calculator as loan } from '../src/calculators/finance/loan.ts';
import { calculator as concrete } from '../src/calculators/construction/concrete.ts';
import { calculator as tile } from '../src/calculators/construction/tile.ts';
import { calculator as paint } from '../src/calculators/construction/paint.ts';
import type { CalculatorDef, Values } from '../src/calculators/types.ts';

function out(def: CalculatorDef, values: Values, id: string): number {
  const r = def.compute(values);
  assert.equal(r.ok, true, 'очікувався успішний результат');
  if (!r.ok) return NaN;
  const o = r.outputs.find((x) => x.id === id);
  assert.ok(o, `немає результату ${id}`);
  return o!.value;
}
const close = (a: number, b: number, eps = 1e-9) =>
  assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

// --- Знижка ---
test('знижка 25% від 1200 = 900, економія 300', () => {
  assert.equal(out(discount, { price: 1200, discount: 25 }, 'finalPrice'), 900);
  assert.equal(out(discount, { price: 1200, discount: 25 }, 'saved'), 300);
});
test('знижка 0% і 100%', () => {
  assert.equal(out(discount, { price: 50, discount: 0 }, 'finalPrice'), 50);
  assert.equal(out(discount, { price: 50, discount: 100 }, 'finalPrice'), 0);
});
test('знижка понад 100% — помилка діапазону', () => {
  assert.deepEqual(discount.compute({ price: 50, discount: 101 }), {
    ok: false, error: 'outOfRange', field: 'discount',
  });
});

// --- ПДВ ---
test('додати ПДВ: 1000 + 20% = 1200', () => {
  const v = { mode: 'add', amount: 1000, rate: 20 };
  assert.equal(out(vat, v, 'vat'), 200);
  assert.equal(out(vat, v, 'net'), 1000);
  assert.equal(out(vat, v, 'gross'), 1200);
});
test('виділити ПДВ: з 1200 при 20% ПДВ = 200', () => {
  const v = { mode: 'extract', amount: 1200, rate: 20 };
  assert.equal(out(vat, v, 'vat'), 200);
  assert.equal(out(vat, v, 'net'), 1000);
  assert.equal(out(vat, v, 'gross'), 1200);
});
test('ставка 0% дає нульовий ПДВ', () => {
  assert.equal(out(vat, { mode: 'extract', amount: 500, rate: 0 }, 'vat'), 0);
});

// --- Площа ---
test('площа прямокутника 4 × 3 м = 12 м²', () => {
  const v = { shape: 'rectangle', unit: 'm', length: 4, width: 3 };
  assert.equal(out(area, v, 'area'), 12);
  assert.equal(area.compute(v).ok && (area.compute(v) as any).outputs.length, 1);
});
test('площа 100 × 100 см = 10000 см² = 1 м²', () => {
  const v = { shape: 'rectangle', unit: 'cm', length: 100, width: 100 };
  assert.equal(out(area, v, 'area'), 10000);
  assert.equal(out(area, v, 'areaM2'), 1);
});
test('площа трикутника 6 × 4 ÷ 2 = 12', () => {
  assert.equal(out(area, { shape: 'triangle', unit: 'm', base: 6, height: 4 }, 'area'), 12);
});
test('площа круга r = 1', () => {
  close(out(area, { shape: 'circle', unit: 'm', radius: 1 }, 'area'), Math.PI, 1e-10);
});
test('площа у футах переводиться в м²', () => {
  close(out(area, { shape: 'rectangle', unit: 'ft', length: 10, width: 10 }, 'areaM2'), 9.290304, 1e-9);
});

// --- Об’єм ---
test('об’єм басейну 5 × 3 × 1.5 = 22.5 м³ = 22500 л', () => {
  const v = { shape: 'box', unit: 'm', length: 5, width: 3, height: 1.5 };
  assert.equal(out(volume, v, 'volume'), 22.5);
  assert.equal(out(volume, v, 'liters'), 22500);
});
test('об’єм циліндра r = 0.5, h = 2', () => {
  close(out(volume, { shape: 'cylinder', unit: 'm', radius: 0.5, height: 2 }, 'volume'), 1.5707963268, 1e-9);
});
test('об’єм кулі r = 1', () => {
  close(out(volume, { shape: 'sphere', unit: 'm', radius: 1 }, 'volume'), 4.18879020479, 1e-9);
});
test('1 м³ у кубічних сантиметрах = 1000000 см³ = 1000 л', () => {
  const v = { shape: 'box', unit: 'cm', length: 100, width: 100, height: 100 };
  assert.equal(out(volume, v, 'volume'), 1000000);
  assert.equal(out(volume, v, 'liters'), 1000);
});

// --- Конвертери ---
test('5 км = 3.106856 миль', () => {
  close(out(length, { value: 5, from: 'km', to: 'mi' }, 'result'), 3.10685596, 1e-7);
});
test('1 дюйм = 2.54 см (без похибки)', () => {
  assert.equal(out(length, { value: 1, from: 'in', to: 'cm' }, 'result'), 2.54);
});
test('та сама одиниця не змінює значення', () => {
  assert.equal(out(length, { value: 7, from: 'm', to: 'm' }, 'result'), 7);
});
test('10 кг = 22.046226 фунта', () => {
  close(out(mass, { value: 10, from: 'kg', to: 'lb' }, 'result'), 22.0462262185, 1e-9);
});
test('1 фунт = 453.59237 г', () => {
  assert.equal(out(mass, { value: 1, from: 'lb', to: 'g' }, 'result'), 453.59237);
});
test('1 т = 1000 кг', () => {
  assert.equal(out(mass, { value: 1, from: 't', to: 'kg' }, 'result'), 1000);
});
test('1 кг ≈ 35.274 унції', () => {
  close(out(mass, { value: 1, from: 'kg', to: 'oz' }, 'result'), 35.27396195, 1e-7);
});

// --- Витрата пального ---
test('450 км, 31,5 л = 7 л/100 км, 0,7 л/10 км, 14,29 км/л', () => {
  const v = { distance: 450, fuel: 31.5 };
  assert.equal(out(fuel, v, 'consumption'), 7);
  assert.equal(out(fuel, v, 'consumptionMil'), 0.7);
  close(out(fuel, v, 'kmPerLiter'), 14.2857142857, 1e-9);
});
test('витрата: нульова відстань і нульове пальне', () => {
  assert.deepEqual(fuel.compute({ distance: 0, fuel: 5 }), { ok: false, error: 'divisionByZero', field: 'distance' });
  assert.deepEqual(fuel.compute({ distance: 100, fuel: 0 }), { ok: false, error: 'outOfRange', field: 'fuel' });
});

// --- Вартість поїздки ---
test('поїздка 300 км, 7 л/100 км, 55 за літр = 21 л і 1155', () => {
  const v = { trip: 'oneWay', distance: 300, consumption: 7, price: 55 };
  assert.equal(out(trip, v, 'fuel'), 21);
  assert.equal(out(trip, v, 'cost'), 1155);
  assert.equal(out(trip, v, 'totalDistance'), 300);
});
test('туди й назад подвоює відстань, пальне і вартість', () => {
  const v = { trip: 'roundTrip', distance: 300, consumption: 7, price: 55 };
  assert.equal(out(trip, v, 'totalDistance'), 600);
  assert.equal(out(trip, v, 'fuel'), 42);
  assert.equal(out(trip, v, 'cost'), 2310);
});

// --- Кредит ---
test('ануїтет: 100000 під 12% на 12 місяців', () => {
  const v = { type: 'annuity', amount: 100000, rate: 12, term: 12, termUnit: 'months' };
  const p = out(loan, v, 'payment');
  close(p, 8884.88, 0.005);
  close(out(loan, v, 'total'), p * 12, 1e-6);
  close(out(loan, v, 'overpayment'), p * 12 - 100000, 1e-6);
});
test('ануїтет: 1 рік дорівнює 12 місяцям', () => {
  const a = out(loan, { type: 'annuity', amount: 100000, rate: 12, term: 1, termUnit: 'years' }, 'payment');
  const b = out(loan, { type: 'annuity', amount: 100000, rate: 12, term: 12, termUnit: 'months' }, 'payment');
  assert.equal(a, b);
});
test('ануїтет без відсотків: рівними частинами', () => {
  assert.equal(out(loan, { type: 'annuity', amount: 1200, rate: 0, term: 12, termUnit: 'months' }, 'payment'), 100);
});
test('диференційований: перший, останній платіж і переплата', () => {
  const v = { type: 'differentiated', amount: 100000, rate: 12, term: 12, termUnit: 'months' };
  close(out(loan, v, 'firstPayment'), 9333.333333, 1e-5);
  close(out(loan, v, 'lastPayment'), 8416.666667, 1e-5);
  close(out(loan, v, 'overpayment'), 6500, 1e-6);
  close(out(loan, v, 'total'), 106500, 1e-6);
});
test('кредит: недопустимі ставка та строк', () => {
  const base = { type: 'annuity', amount: 1000, rate: 10, term: 5, termUnit: 'years' };
  assert.deepEqual(loan.compute({ ...base, term: 0 }), { ok: false, error: 'outOfRange', field: 'term' });
  assert.deepEqual(loan.compute({ ...base, term: 101 }), { ok: false, error: 'outOfRange', field: 'term' });
  assert.deepEqual(loan.compute({ ...base, rate: 2000 }), { ok: false, error: 'outOfRange', field: 'rate' });
});

// --- Бетон ---
test('плита 6 × 4 м × 15 см із запасом 5% = 3,6 і 3,78 м³', () => {
  const v = { length: 6, width: 4, thickness: 15, reserve: 5 };
  assert.equal(out(concrete, v, 'volume'), 3.6);
  assert.equal(out(concrete, v, 'withReserve'), 3.78);
});

// --- Плитка ---
test('плитка: 12 м², 30 × 30 см, запас 10% = 134 без запасу і 147 із запасом', () => {
  const v = { length: 4, width: 3, tileLength: 30, tileWidth: 30, reserve: 10 };
  assert.equal(out(tile, v, 'area'), 12);
  assert.equal(out(tile, v, 'tilesExact'), 134);
  assert.equal(out(tile, v, 'tiles'), 147);
});
test('плитка: рівно 300 штук не округлюється до 301', () => {
  const v = { length: 4, width: 3, tileLength: 20, tileWidth: 20, reserve: 0 };
  assert.equal(out(tile, v, 'tiles'), 300);
});
test('плитка: нульовий розмір плитки', () => {
  const v = { length: 4, width: 3, tileLength: 0, tileWidth: 30, reserve: 0 };
  assert.deepEqual(tile.compute(v), { ok: false, error: 'divisionByZero', field: 'tileLength' });
});

// --- Фарба ---
test('фарба: 40 м², 2 шари, 10 м²/л = 8 л; банки 5 л → 2', () => {
  const v = { area: 40, coats: 2, coverage: 10, can: 'l5' };
  assert.equal(out(paint, v, 'liters'), 8);
  assert.equal(out(paint, v, 'cans'), 2);
});
test('фарба: округлення банок угору (8 л / 2,5 л → 4)', () => {
  assert.equal(out(paint, { area: 40, coats: 2, coverage: 10, can: 'l2_5' }, 'cans'), 4);
  assert.equal(out(paint, { area: 40, coats: 2, coverage: 10, can: 'l10' }, 'cans'), 1);
});
test('фарба: покриття 0 і менше одного шару', () => {
  assert.deepEqual(paint.compute({ area: 40, coats: 2, coverage: 0, can: 'l5' }), { ok: false, error: 'divisionByZero', field: 'coverage' });
  assert.deepEqual(paint.compute({ area: 40, coats: 0, coverage: 10, can: 'l5' }), { ok: false, error: 'outOfRange', field: 'coats' });
});
