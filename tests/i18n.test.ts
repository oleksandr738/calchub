import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculators } from '../src/calculators/registry.ts';
import { categories } from '../src/utils/categories.ts';

const langs = ['uk', 'en', 'sv'] as const;
const dict: Record<string, any> = {};
for (const l of langs) {
  dict[l] = JSON.parse(readFileSync(new URL(`../src/i18n/${l}.json`, import.meta.url), 'utf8'));
}

function flatten(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}
const get = (lang: string, key: string): unknown =>
  key.split('.').reduce<any>((o, p) => (o ? o[p] : undefined), dict[lang]);

test('усі три мови мають однакові ключі', () => {
  const base = flatten(dict.uk).sort();
  for (const l of ['en', 'sv']) {
    assert.deepEqual(flatten(dict[l]).sort(), base, `ключі ${l} відрізняються від uk`);
  }
});

test('жоден переклад не порожній', () => {
  for (const l of langs) {
    for (const key of flatten(dict[l])) {
      const v = get(l, key);
      assert.ok(typeof v === 'string' && v.trim() !== '', `${l}: порожній ${key}`);
    }
  }
});

test('кожна категорія має переклад', () => {
  for (const l of langs) {
    for (const c of categories) {
      assert.ok(get(l, `categories.${c.slug}.name`), `${l}: categories.${c.slug}`);
    }
  }
});

test('кожен калькулятор має всі потрібні переклади', async () => {
  for (const calc of calculators) {
    const need = ['title', 'name', 'description', 'intro', 'keywords'];
    for (let i = 1; i <= calc.faqCount; i++) need.push(`faq${i}q`, `faq${i}a`);

    if (calc.load) {
      const { calculator: def } = await calc.load();
      need.push('howItWorks', 'example');
      for (const f of def.fields) {
        need.push(`fields.${f.id}.label`);
        if (f.type === 'select') for (const o of f.options) need.push(`fields.${f.id}.options.${o}`);
      }
      for (const o of def.outputs) need.push(`outputs.${o}`);
    }
    for (const l of langs) {
      for (const k of need) {
        assert.ok(get(l, `calculators.${calc.slug}.${k}`), `${l}: calculators.${calc.slug}.${k}`);
      }
    }
  }
});

test('усі одиниці, що використовуються, мають переклад', () => {
  const used = ['m','cm','mm','km','mi','yd','ft','in','kg','g','mg','t','lb','oz','m2','cm2','mm2','ft2','m3','cm3','mm3','ft3','L','L100','L10','kmL'];
  for (const l of langs) for (const u of used) assert.ok(get(l, `units.${u}`), `${l}: units.${u}`);
});
