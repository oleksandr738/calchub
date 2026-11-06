import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BRAND } from '../src/utils/brand.ts';
import { calculators } from '../src/calculators/registry.ts';

// Стара назва складена з частин, щоб цей файл сам її не містив
const OLD_NAME = new RegExp(['calc', 'hub'].join(''), 'i');
const TEXT_EXT = /\.(astro|ts|mjs|json|jsonc|svg|css|txt|md|html)$/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test('у коді сайту не лишилося старої назви', () => {
  const files = ['src', 'public', 'scripts', 'tests'].flatMap((d) => walk(d)).filter((f) => TEXT_EXT.test(f));
  assert.ok(files.length > 50, 'очікували багато файлів для перевірки');
  const offenders = files.filter((f) => OLD_NAME.test(readFileSync(f, 'utf8')));
  assert.deepEqual(offenders, []);
});

test('значок сайту не містить старої назви й існує картинка для прев’ю', () => {
  assert.ok(statSync('public/og-image.png').size > 1000);
  assert.ok(statSync('public/favicon.svg').size > 50);
});

test('назва бренду задана', () => {
  assert.equal(BRAND, 'Tallora');
});

test('заголовки сторінок усіма мовами закінчуються назвою бренду', () => {
  for (const lang of ['uk', 'en', 'sv']) {
    const d = JSON.parse(readFileSync(`src/i18n/${lang}.json`, 'utf8'));
    assert.ok(d.home.title.endsWith(` — ${BRAND}`) || d.home.title.startsWith(`${BRAND} — `), `${lang}: home.title`);
    for (const c of calculators) {
      const title: string = d.calculators[c.slug].title;
      assert.ok(title.endsWith(` — ${BRAND}`), `${lang}: ${c.slug}: «${title}»`);
    }
  }
});
