import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculator as discount } from '../src/calculators/finance/discount.ts';
import { calculator as vat } from '../src/calculators/finance/vat.ts';
import { calculator as area } from '../src/calculators/construction/area.ts';
import { calculator as volume } from '../src/calculators/construction/volume.ts';
import { calculator as length } from '../src/calculators/conversion/length.ts';
import { calculator as mass } from '../src/calculators/conversion/mass.ts';
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
