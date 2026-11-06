import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePercentage } from '../src/calculators/finance/percentage.ts';

function value(mode: Parameters<typeof calculatePercentage>[0], a: number, b: number) {
  const r = calculatePercentage(mode, a, b);
  assert.equal(r.ok, true);
  return r.ok ? r.value : NaN;
}

test('15% від 200 = 30', () => assert.equal(value('percentOf', 15, 200), 30));
test('0.1% від 3 без похибки', () => assert.equal(value('percentOf', 10, 0.3), 0.03));
test('30 від 200 = 15%', () => assert.equal(value('whatPercent', 30, 200), 15));
test('зміна 100 -> 150 = +50%', () => assert.equal(value('change', 100, 150), 50));
test('зміна 200 -> 150 = -25%', () => assert.equal(value('change', 200, 150), -25));
test('зміна від від’ємного: -50 -> -25 = +50%', () => assert.equal(value('change', -50, -25), 50));
test('200 + 10% = 220', () => assert.equal(value('increase', 200, 10), 220));
test('200 - 10% = 180', () => assert.equal(value('decrease', 200, 10), 180));
test('100 -20% потім +20% = 96', () => {
  const down = value('decrease', 100, 20);
  assert.equal(value('increase', down, 20), 96);
});

test('ділення на нуль: ціле = 0', () => {
  assert.deepEqual(calculatePercentage('whatPercent', 5, 0), { ok: false, error: 'divisionByZero' });
});
test('ділення на нуль: початкове = 0', () => {
  assert.deepEqual(calculatePercentage('change', 0, 5), { ok: false, error: 'divisionByZero' });
});
test('переповнення', () => {
  assert.deepEqual(calculatePercentage('percentOf', 1e308, 1e308), { ok: false, error: 'overflow' });
});
