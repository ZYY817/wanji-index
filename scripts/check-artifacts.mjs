// 产物断言门 —— Next.js 静态导出版（out/ 目录）
// 用法：node check-artifacts.mjs [distDir]（默认 out）
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadSiteConfig, PROJECT_ROOT } from '../src/lib/config.mjs';

const DIST = join(PROJECT_ROOT, process.argv[2] ?? 'out');
const site = loadSiteConfig();
let pass = 0, fail = 0;
const A = (ok, msg) => { ok ? pass++ : fail++; console.log(`${ok ? '✓' : '✗'} ${msg}`); };
const read = (f) => readFileSync(join(DIST, f), 'utf8');
const exists = (f) => existsSync(join(DIST, f));
const htmlFiles = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) htmlFiles(p, out);
    else if (f === 'index.html') out.push(p);
  }
  return out;
};
const siteBase = site.url.replace(/\/$/, '');

// ── 首页 ──
A(exists('index.html'), 'index.html 存在');
const home = read('index.html');
A(home.includes(`<link rel="canonical" href="${siteBase}/"`), `canonical 正确（${siteBase}/）`);
A(/<title>/.test(home), '首页有 title');
A(!home.includes('localhost'), '首页无 localhost 残留');

// ── 全产物扫描 ──
const pages = htmlFiles(DIST);
const banned = ['fixture-demo', 'fixture-draft', '_demo', 'undefined', 'NaN'];
for (const f of pages) {
  const html = readFileSync(f, 'utf8');
  const rel = relative(DIST, f);
  for (const m of ['fixture-demo', 'fixture-draft', '_demo'])
    A(!html.includes(m), `${rel} 不含禁用标记 ${m}`);
}
A(!pages.some((f) => f.includes('fixture-')), '无 fixture 页面生成');

// ── sitemap ⊆ HTML ──
if (exists('sitemap.xml')) {
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const htmlPaths = new Set(pages.map((f) => siteBase + '/' + relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '')));
  A(!locs.some((l) => l.includes('/search')), 'sitemap 不含 /search/');
  A(!locs.some((l) => l.includes('404')), 'sitemap 不含 404');
  for (const l of locs) A(htmlPaths.has(l), `sitemap 条目存在对应 HTML：${l.replace(siteBase, '')}`);
}

// ── robots / 搜索索引 / _redirects ──
A(exists('robots.txt'), 'robots.txt 存在');
if (exists('robots.txt')) {
  A(read('robots.txt').includes('Disallow: /search/'), 'robots 禁 /search/');
  A(read('robots.txt').includes(`Sitemap: ${siteBase}/sitemap.xml`), 'robots 指向正确 sitemap');
}
A(exists('search-index.json'), 'search-index.json 存在');
if (exists('search-index.json')) {
  const idx = JSON.parse(read('search-index.json'));
  A(Array.isArray(idx.items) && idx.items.length > 0, `搜索索引非空（${idx.items?.length} 条）`);
  A(!idx.items.some((i) => i.url.includes('fixture')), '索引无 fixture 条目');
}
A(exists('_redirects'), '_redirects 已生成');
A(exists('404.html') || exists('404/index.html'), '404 页存在');

console.log(`\n产物检查：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
