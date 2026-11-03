// Перевірка зібраного сайту (папка dist). Запуск: node scripts/check-site.mjs
// Спочатку збудуйте сайт: npm run build
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
if (!fs.existsSync(DIST)) {
  console.error('Папки dist немає. Спочатку виконайте: npm run build');
  process.exit(1);
}

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const files = walk(DIST);
const rel = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/');
const htmlFiles = files.filter((f) => f.endsWith('.html'));

const urlToFile = (url) => {
  const clean = url.split('#')[0].split('?')[0];
  if (clean.endsWith('/')) return path.join(DIST, clean, 'index.html');
  const direct = path.join(DIST, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  return path.join(DIST, clean, 'index.html');
};
const exists = (url) => fs.existsSync(urlToFile(decodeURI(url)));

const pages = htmlFiles.filter((f) => rel(f) !== '/index.html' && rel(f) !== '/404.html');
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
let linkCount = 0;

for (const file of htmlFiles) {
  const name = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  const isPage = pages.includes(file);

  // --- внутрішні посилання ---
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    linkCount++;
    if (!exists(url)) err(`${name}: бите посилання → ${url}`);
  }

  if (name === '/404.html') {
    if (!/<meta name="robots" content="noindex/.test(html)) err('404.html: немає noindex');
    continue;
  }
  if (!isPage) continue;

  // --- SEO-елементи ---
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim();
  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1]?.trim();
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  if (!title) err(`${name}: немає <title>`);
  if (!desc) err(`${name}: немає meta description`);
  if (!canonical) err(`${name}: немає canonical`);
  if (title && title.length > 70) warn(`${name}: довгий title (${title.length} символів)`);
  if (desc && desc.length > 200) warn(`${name}: довгий description (${desc.length} символів)`);

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) err(`${name}: має бути рівно один <h1>, знайдено ${h1s}`);

  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]);
  if (hreflangs.length !== 4) err(`${name}: hreflang має бути 4 (uk, en, sv, x-default), знайдено ${hreflangs.length}`);

  for (const tag of ['og:title', 'og:description', 'og:url', 'og:image', 'og:locale']) {
    if (!html.includes(`property="${tag}"`)) err(`${name}: немає ${tag}`);
  }

  // --- JSON-LD ---
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (ld.length === 0) err(`${name}: немає структурованих даних JSON-LD`);
  for (const block of ld) {
    try {
      const data = JSON.parse(block[1]);
      if (!data['@context'] || !data['@type']) err(`${name}: JSON-LD без @context/@type`);
    } catch (e) {
      err(`${name}: некоректний JSON-LD (${e.message})`);
    }
  }

  // --- унікальність ---
  if (title) titles.set(title, [...(titles.get(title) ?? []), name]);
  if (desc) descriptions.set(desc, [...(descriptions.get(desc) ?? []), name]);
  if (canonical) canonicals.set(name, canonical);
}

for (const [t, list] of titles) if (list.length > 1) err(`Однакові title (${list.length}): «${t}» → ${list.join(', ')}`);
for (const [d, list] of descriptions) if (list.length > 1) err(`Однакові description (${list.length}): «${d.slice(0, 60)}…» → ${list.join(', ')}`);

// --- sitemap ---
const sitemapPath = path.join(DIST, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  err('Немає sitemap.xml');
} else {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (new Set(locs).size !== locs.length) err('sitemap.xml: є повтори адрес');
  if (locs.length !== pages.length) err(`sitemap.xml: ${locs.length} адрес, а сторінок на сайті ${pages.length}`);
  const canonicalSet = new Set(canonicals.values());
  for (const loc of locs) {
    const u = new URL(loc);
    if (!exists(u.pathname)) err(`sitemap.xml: адреса не існує на сайті → ${loc}`);
    if (!canonicalSet.has(loc)) err(`sitemap.xml: адреса не збігається з canonical жодної сторінки → ${loc}`);
  }
}

// --- robots ---
const robotsPath = path.join(DIST, 'robots.txt');
if (!fs.existsSync(robotsPath)) err('Немає robots.txt');
else if (!/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m.test(fs.readFileSync(robotsPath, 'utf8'))) err('robots.txt: немає рядка Sitemap');

for (const f of ['404.html', 'og-image.png', 'favicon.svg', '_headers', '_redirects']) {
  if (!fs.existsSync(path.join(DIST, f))) err(`Немає файлу ${f}`);
}

// --- підсумок ---
console.log(`Сторінок: ${pages.length} · перевірено внутрішніх посилань: ${linkCount}`);
for (const w of warnings) console.log(`  попередження: ${w}`);
if (errors.length) {
  console.log(`\nПОМИЛОК: ${errors.length}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  process.exit(1);
}
console.log('Усе гаразд: битих посилань, дублікатів і проблем з SEO не знайдено.');
