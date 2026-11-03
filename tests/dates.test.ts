import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseISODate } from '../src/utils/validation.ts';
import { countWorkdays, dayNumber, daysInMonth, isLeap, parseDate, weekday, ymdDiff } from '../src/calculators/dates.ts';
import { calculator as age } from '../src/calculators/everyday/age.ts';
import { calculator as between } from '../src/calculators/everyday/days-between.ts';
import { calculator as until } from '../src/calculators/everyday/days-until.ts';
import type { CalculatorDef, Values } from '../src/calculators/types.ts';

function out(def: CalculatorDef, values: Values, id: string): number {
  const r = def.compute(values);
  assert.equal(r.ok, true, JSON.stringify(r));
  if (!r.ok) return NaN;
  const o = r.outputs.find((x) => x.id === id);
  assert.ok(o, `немає результату ${id}`);
  return o!.value;
}
const dn = (s: string) => dayNumber(parseDate(s));

// --- parseISODate ---
test('parseISODate: коректні дати', () => {
  assert.deepEqual(parseISODate('2024-02-29'), { status: 'ok', value: '2024-02-29' });
  assert.deepEqual(parseISODate('1990-05-15'), { status: 'ok', value: '1990-05-15' });
  assert.deepEqual(parseISODate(''), { status: 'empty' });
});
test('parseISODate: некоректні дати', () => {
  for (const bad of ['2023-02-29', '2024-13-01', '2024-04-31', '2024-00-10', '0000-01-01', '275760-09-13', '24-01-01', 'abc', '2024-1-1']) {
    assert.deepEqual(parseISODate(bad), { status: 'invalid' }, bad);
  }
});

// --- допоміжні функції ---
test('високосні роки', () => {
  assert.equal(isLeap(2024), true);
  assert.equal(isLeap(1900), false);
  assert.equal(isLeap(2000), true);
  assert.equal(daysInMonth(2024, 2), 29);
  assert.equal(daysInMonth(2023, 2), 28);
});
test('dayNumber: епоха і день тижня', () => {
  assert.equal(dn('1970-01-01'), 0);
  assert.equal(dn('1970-01-02'), 1);
  assert.equal(weekday(dn('1970-01-01')), 4); // четвер
  assert.equal(weekday(dn('2024-01-01')), 1); // понеділок
  assert.equal(weekday(dn('2026-12-01')), 2); // вівторок
  assert.equal(weekday(dn('1969-12-31')), 3); // середа (до епохи)
});
test('dayNumber: рік 99 не плутається з 1999', () => {
  assert.ok(dn('0099-01-01') < dn('1000-01-01'));
});
test('dayNumber: різниця не залежить від переходу на літній час', () => {
  assert.equal(dn('2024-03-31') - dn('2024-03-30'), 1);
  assert.equal(dn('2024-10-28') - dn('2024-10-27'), 1);
});
test('ymdDiff', () => {
  assert.deepEqual(ymdDiff(parseDate('1990-05-15'), parseDate('2024-03-10')), { years: 33, months: 9, days: 24 });
  assert.deepEqual(ymdDiff(parseDate('2000-01-31'), parseDate('2000-02-28')), { years: 0, months: 0, days: 28 });
  assert.deepEqual(ymdDiff(parseDate('2023-12-25'), parseDate('2024-01-10')), { years: 0, months: 0, days: 16 });
  assert.deepEqual(ymdDiff(parseDate('2000-02-29'), parseDate('2024-02-29')), { years: 24, months: 0, days: 0 });
  assert.deepEqual(ymdDiff(parseDate('2024-05-10'), parseDate('2024-05-10')), { years: 0, months: 0, days: 0 });
});
test('countWorkdays', () => {
  assert.equal(countWorkdays(dn('2024-01-01'), 7), 5);
  assert.equal(countWorkdays(dn('2024-01-01'), 31), 23);
  assert.equal(countWorkdays(dn('2024-01-06'), 2), 0); // субота, неділя
  assert.equal(countWorkdays(dn('2024-01-01'), 0), 0);
});

// --- Вік ---
test('вік: 15.05.1990 на 10.03.2024 = 33 р. 9 міс. 24 дн., 12353 дн. прожито', () => {
  const v = { birth: '1990-05-15', asOf: '2024-03-10' };
  assert.equal(out(age, v, 'years'), 33);
  assert.equal(out(age, v, 'months'), 9);
  assert.equal(out(age, v, 'days'), 24);
  assert.equal(out(age, v, 'totalDays'), 12353);
});
test('вік: днів до наступного дня народження', () => {
  assert.equal(out(age, { birth: '1990-05-15', asOf: '2024-03-10' }, 'daysToBirthday'), 66);
  assert.equal(out(age, { birth: '1990-05-15', asOf: '2024-05-15' }, 'daysToBirthday'), 0);
  assert.equal(out(age, { birth: '1990-05-15', asOf: '2024-05-16' }, 'daysToBirthday'), 364);
});
test('вік: народження 29 лютого — у невисокосний рік день народження 1 березня', () => {
  assert.equal(out(age, { birth: '2000-02-29', asOf: '2023-02-01' }, 'daysToBirthday'), 28); // до 1 березня 2023
  assert.equal(out(age, { birth: '2000-02-29', asOf: '2023-12-01' }, 'daysToBirthday'), 90); // до 29 лютого 2024
});
test('вік: народився сьогодні = 0', () => {
  const v = { birth: '2024-03-10', asOf: '2024-03-10' };
  assert.equal(out(age, v, 'years'), 0);
  assert.equal(out(age, v, 'totalDays'), 0);
});
test('вік: дата народження пізніша за дату розрахунку', () => {
  assert.deepEqual(age.compute({ birth: '2030-01-01', asOf: '2024-01-01' }), { ok: false, error: 'dateOrder', field: 'birth' });
});

// --- Дні між датами ---
test('1 січня — 1 лютого 2024 = 31 день, 4 тижні і 3 дні, 23 робочих', () => {
  const v = { start: '2024-01-01', end: '2024-02-01', includeEnd: 'no' };
  assert.equal(out(between, v, 'days'), 31);
  assert.equal(out(between, v, 'weeks'), 4);
  assert.equal(out(between, v, 'rest'), 3);
  assert.equal(out(between, v, 'workdays'), 23);
});
test('враховуючи кінцеву дату додається 1 день', () => {
  assert.equal(out(between, { start: '2024-01-01', end: '2024-01-01', includeEnd: 'yes' }, 'days'), 1);
  assert.equal(out(between, { start: '2024-01-01', end: '2024-01-01', includeEnd: 'no' }, 'days'), 0);
});
test('дати в зворотному порядку дають той самий результат', () => {
  const a = out(between, { start: '2024-01-01', end: '2024-03-01', includeEnd: 'no' }, 'days');
  const b = out(between, { start: '2024-03-01', end: '2024-01-01', includeEnd: 'no' }, 'days');
  assert.equal(a, 60); // 2024 високосний: 31 + 29
  assert.equal(a, b);
});
test('через рік: 365 і 366 днів', () => {
  assert.equal(out(between, { start: '2023-01-01', end: '2024-01-01', includeEnd: 'no' }, 'days'), 365);
  assert.equal(out(between, { start: '2024-01-01', end: '2025-01-01', includeEnd: 'no' }, 'days'), 366);
});

// --- Дні до події ---
test('1 грудня — 25 грудня 2026: 24 дні, 3 тижні, 18 робочих', () => {
  const v = { event: '2026-12-25', from: '2026-12-01' };
  assert.equal(out(until, v, 'days'), 24);
  assert.equal(out(until, v, 'weeks'), 3);
  assert.equal(out(until, v, 'workdays'), 18);
});
test('подія вже минула: показує «днів після»', () => {
  const r = until.compute({ event: '2026-12-01', from: '2026-12-25' });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.outputs[0]!.id, 'daysAgo');
    assert.equal(r.outputs[0]!.value, 24);
    assert.equal(r.outputs.find((o) => o.id === 'workdays')!.value, 18);
  }
});
test('подія сьогодні = 0 днів', () => {
  assert.equal(out(until, { event: '2026-11-03', from: '2026-11-03' }, 'days'), 0);
});
