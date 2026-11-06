import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageRoutes } from '../src/utils/routes.ts';
import { categories } from '../src/utils/categories.ts';
import { calculators } from '../src/calculators/registry.ts';
import { absoluteUrl, breadcrumbLd, faqLd, jsonLdString, webAppLd } from '../src/utils/seo.ts';

test('кількість сторінок = головна + каталог + категорії + калькулятори', () => {
  assert.equal(pageRoutes().length, 2 + categories.length + calculators.length);
});

test('адреси сторінок унікальні, починаються з мови і закінчуються слешем', () => {
  const paths = pageRoutes().map((r) => r.path('uk'));
  assert.equal(new Set(paths).size, paths.length);
  for (const p of paths) {
    assert.ok(p.startsWith('/uk/'), p);
    assert.ok(p.endsWith('/'), p);
  }
});

test('slug-и калькуляторів унікальні, а їхні категорії існують', () => {
  const slugs = calculators.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  const known = new Set(categories.map((c) => c.slug));
  for (const c of calculators) {
    assert.ok(known.has(c.category), `${c.slug}: невідома категорія ${c.category}`);
    for (const a of c.also ?? []) assert.ok(known.has(a), `${c.slug}: невідома додаткова категорія ${a}`);
  }
});

test('absoluteUrl будує повну адресу', () => {
  assert.equal(absoluteUrl('/uk/finance/', 'https://example.com'), 'https://example.com/uk/finance/');
});

test('BreadcrumbList: позиції з 1 і повні адреси', () => {
  const ld = breadcrumbLd(
    [{ name: 'Головна', path: '/uk/' }, { name: 'Фінанси', path: '/uk/finance/' }],
    'https://example.com',
  );
  assert.equal(ld['@type'], 'BreadcrumbList');
  assert.deepEqual(ld.itemListElement.map((i) => i.position), [1, 2]);
  assert.equal(ld.itemListElement[1]!.item, 'https://example.com/uk/finance/');
});

test('FAQPage і WebApplication мають обов’язкові поля', () => {
  const faq = faqLd([{ q: 'Питання?', a: 'Відповідь.' }]);
  assert.equal(faq.mainEntity[0]!.acceptedAnswer.text, 'Відповідь.');
  const app = webAppLd({ name: 'N', description: 'D', url: 'https://example.com/', lang: 'uk' });
  assert.equal(app['@type'], 'WebApplication');
  assert.equal(app.isAccessibleForFree, true);
});

test('jsonLdString екранує "<", щоб не закрити тег script', () => {
  const s = jsonLdString({ text: '</script><b>' });
  assert.ok(!s.includes('<'));
  assert.deepEqual(JSON.parse(s), { text: '</script><b>' });
});
