import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber } from '../src/utils/validation.ts';

test('порожнє значення', () => {
  assert.deepEqual(parseNumber(''), { status: 'empty' });
  assert.deepEqual(parseNumber('   '), { status: 'empty' });
});
test('ціле і дробове з крапкою', () => {
  assert.deepEqual(parseNumber('12'), { status: 'ok', value: 12 });
  assert.deepEqual(parseNumber('12.5'), { status: 'ok', value: 12.5 });
});
test('кома як десятковий роздільник', () => {
  assert.deepEqual(parseNumber('12,5'), { status: 'ok', value: 12.5 });
});
test('від’ємні та пробіли', () => {
  assert.deepEqual(parseNumber('-3,5'), { status: 'ok', value: -3.5 });
  assert.deepEqual(parseNumber('1 000'), { status: 'ok', value: 1000 });
});
test('некоректні значення', () => {
  for (const bad of ['abc', '1.2.3', '12a', '--1', '1e5', '.', '1,2,3']) {
    assert.deepEqual(parseNumber(bad), { status: 'invalid' }, bad);
  }
});
