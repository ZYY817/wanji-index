// 产物一致性检查（M0 基础版）：任一断言失败 = 非零退出 = 不部署
// 用法：node scripts/check-artifacts.mjs [distDir]（默认 dist；测试构建传 dist-test）
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadSiteConfig, PROJECT_ROOT } from '../src/lib/config.mjs';

const DIST = join(PROJECT_ROOT, process.argv[2] || 'dist');
const site = loadSiteConfig();
const fail = [], ok = [];
const A = (cond, msg) => (cond ? ok : fail).push(msg);
const exists = (p) => existsSync(join(DIST, p));
const read = (p) => readFileSync(join(DIST, p), 'utf8');

const htmlFiles = (dir, acc = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    try { readdirSync(p); htmlFiles(p, acc); }
    catch { f.endsWith('.html') && acc.push(p); }
  }
  return acc;
};

A(exists('index.html'), '首页已生成');
if (exists('index.html')) {
  const html = read('index.html');
  A(html.includes('canonical'), '首页含 canonical');
  const m = html.match(/canonical" href="([^"]+)"/);
  A(m && m[1].startsWith(site.url), `canonical 域名与 site.json 一致（${m?.[1]}）`);
  A(m && m[1].endsWith('/'), 'canonical 尾斜杠');
}

// 全产物扫描：demo/draft/offline/fixture 标记不得出现在任何 HTML
const pages = existsSync(DIST) ? htmlFiles(DIST) : [];
for (const f of pages) {
  const html = readFileSync(f, 'utf8');
  for (const marker of ['fixture-demo', 'fixture-draft', '_demo'])
    A(!html.includes(marker), `${f.split(DIST)[1]} 不含禁用标记 ${marker}`);
}

// sitemap ⊆ 实有 HTML（docs/06 产物断言）
if (exists('sitemap-0.xml')) {
  const xml = read('sitemap-0.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const base = site.url.replace(/\/$/, '') + (site.base === '/' ? '' : site.base.replace(/\/$/, ''));
  const htmlPaths = new Set(pages.map((f) => base + f.split(DIST)[1].replace(/\\/g, '/').replace(/index\.html$/, '')));
  A(!locs.some((l) => l.includes('/search/')), 'sitemap 不含 /search/');
  A(!locs.some((l) => l.endsWith('404')), 'sitemap 不含 404');
  for (const l of locs) A(htmlPaths.has(l), `sitemap 条目存在对应 HTML：${l.replace(base, '')}`);
}

// _redirects 已生成
A(exists('_redirects'), '_redirects 已生成');

for (const m of ok) console.log('✓', m);
for (const m of fail) console.log('✗', m);
console.log(`\n产物检查：${ok.length} 通过 / ${fail.length} 失败`);
process.exit(fail.length ? 1 : 0);
