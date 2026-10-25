// 资源站官方图标抓取：访问各站官网首页，按页面自己声明的图标（apple-touch-icon > svg icon > 最大尺寸 icon > /favicon.ico）
// 官网拿不到（防爬）或只有很小的位图时，回退到 Google 图标服务的 128px 版本（同样只在抓取时请求一次）。
// 下载到 public/logos/<id>.<ext>，并写出 src/lib/site-logos.json（id → 站内路径）。页面只引用本地文件，不在访客端请求第三方。
// 用法：node scripts/fetch-logos.mjs [--force]   （默认跳过已存在的文件）
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public', 'logos');
const MANIFEST = join(ROOT, 'src', 'lib', 'site-logos.json');
const FORCE = process.argv.includes('--force');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
mkdirSync(OUT, { recursive: true });

const sites = readdirSync(join(ROOT, 'data', 'sites'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'sites', f), 'utf8')));
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};

const EXT = { 'image/svg+xml': 'svg', 'image/png': 'png', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico', 'image/webp': 'webp', 'image/jpeg': 'jpg' };

async function get(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow', signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/** 从首页 HTML 里取出所有图标候选，按清晰度排序 */
function candidates(html, base) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? '';
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || !/icon/.test(rel) || /mask-icon/.test(rel)) continue;
    const size = Number(/sizes=["'](\d+)x\d+["']/i.exec(tag)?.[1] ?? 0);
    const svg = /\.svg(\?|$)/i.test(href) || /svg/i.test(/type=["']([^"']+)["']/i.exec(tag)?.[1] ?? '');
    const score = (rel.includes('apple-touch-icon') ? 1000 : 0) + (svg ? 900 : 0) + size;
    try { out.push({ url: new URL(href, base).href, score }); } catch { /* 无效地址忽略 */ }
  }
  out.sort((a, b) => b.score - a.score);
  out.push({ url: new URL('/apple-touch-icon.png', base).href, score: 0 }, { url: new URL('/favicon.ico', base).href, score: 0 });
  return out;
}

/** 按文件头判断是否真的是图片（PNG / ICO / JPEG / GIF / WebP / SVG） */
function isImage(buf) {
  const head = buf.subarray(0, 12);
  const text = buf.subarray(0, 256).toString('utf8').trimStart().toLowerCase();
  return head[0] === 0x89 && head[1] === 0x50 // PNG
    || (head[0] === 0 && head[1] === 0 && head[2] === 1 && head[3] === 0) // ICO
    || (head[0] === 0xff && head[1] === 0xd8) // JPEG
    || head.toString('ascii', 0, 3) === 'GIF'
    || (head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WEBP')
    || text.startsWith('<svg') || (text.startsWith('<?xml') && text.includes('<svg'));
}

async function fetchLogo(site) {
  const page = await get(site.url);
  const html = page.ok ? await page.text() : '';
  for (const c of candidates(html, page.url || site.url)) {
    try {
      const r = await get(c.url);
      if (!r.ok) continue;
      const type = (r.headers.get('content-type') ?? '').split(';')[0].trim();
      const ext = EXT[type] ?? (/\.svg/i.test(c.url) ? 'svg' : /\.png/i.test(c.url) ? 'png' : /\.ico/i.test(c.url) ? 'ico' : null);
      const buf = Buffer.from(await r.arrayBuffer());
      if (!ext || buf.length < 100) continue; // 空文件 / 占位
      if (/html|text/.test(type) || !isImage(buf)) continue; // 单页应用会对不存在的图标地址返回 200 + HTML
      const file = `${site.id}.${ext}`;
      writeFileSync(join(OUT, file), buf);
      return { file, from: c.url, bytes: buf.length };
    } catch { /* 下一个候选 */ }
  }
  return null;
}

/** 回退：Google 图标服务（返回该域名可用的最大图标，最大 128px） */
async function fetchFallback(site) {
  const host = new URL(site.url).hostname;
  const r = await get(`https://www.google.com/s2/favicons?domain=${host}&sz=128`);
  if (!r.ok) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 300 || !isImage(buf)) return null;
  return { buf, from: r.url };
}

let ok = 0, fail = 0;
for (const site of sites) {
  if (!FORCE && manifest[site.id] && existsSync(join(ROOT, 'public', manifest[site.id]))) { ok++; continue; }
  try {
    let got = await fetchLogo(site).catch(() => null);
    // 官网图标缺失或是低清位图（< 3KB 的 png / ico）时，用更大的回退版本替换
    if (!got || (got.file.endsWith('svg') === false && got.bytes < 3000)) {
      const fb = await fetchFallback(site).catch(() => null);
      if (fb && (!got || fb.buf.length > got.bytes)) {
        const file = `${site.id}.png`;
        writeFileSync(join(OUT, file), fb.buf);
        got = { file, from: fb.from, bytes: fb.buf.length };
      }
    }
    if (got) { manifest[site.id] = `/logos/${got.file}`; ok++; console.log(`✓ ${site.id.padEnd(18)} ${got.bytes}B  ${got.from}`); }
    else { fail++; console.log(`✗ ${site.id.padEnd(18)} 没有找到可用图标`); }
  } catch (e) {
    fail++; console.log(`✗ ${site.id.padEnd(18)} ${e.message}`);
  }
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n图标：${ok} 成功 / ${fail} 失败 → ${MANIFEST}`);
