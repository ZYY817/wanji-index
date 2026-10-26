// 工具图标抓取：每个工具按「项目自己的图标 → 官网声明的图标 → 包页面的预览图 → Google 图标服务」依次尝试。
// 托管在 GitHub / Steam 上的工具不能用站点图标（会拿到 GitHub、Steam 自己的标志），所以为它们写明了项目图标的位置。
// 下载到 public/logos/tools/<id>.<ext>，写出 src/lib/tool-logos.json。页面只引用本地文件。
// 用法：node scripts/fetch-tool-logos.mjs [--force]
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join('public', 'logos', 'tools');
const MANIFEST = join('src', 'lib', 'tool-logos.json');
const FORCE = process.argv.includes('--force');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
mkdirSync(OUT, { recursive: true });

/** 项目自己的图标（优先）：仓库里的图标文件、项目组织的头像 */
const HINTS = {
  ludusavi: ['https://raw.githubusercontent.com/mtkennerly/ludusavi/master/assets/icon.svg', 'https://raw.githubusercontent.com/mtkennerly/ludusavi/master/assets/icon.png'],
  'mod-organizer-2': ['https://raw.githubusercontent.com/ModOrganizer2/modorganizer/master/src/mo_icon.ico'],
  r2modman: ['https://raw.githubusercontent.com/ebkr/r2modmanPlus/develop/src/assets/icon/favicon.png'],
  tmodloader: ['https://github.com/tModLoader.png?size=256'],
  vortex: ['https://raw.githubusercontent.com/Nexus-Mods/Vortex/master/assets/images/vortex.png', 'https://raw.githubusercontent.com/Nexus-Mods/Vortex/master/src/assets/images/vortex.png'],
};
/** 不能拿站点图标的托管平台 */
const HOSTED = /(^|\.)github\.com$|(^|\.)steampowered\.com$/;
const EXT = { 'image/svg+xml': 'svg', 'image/png': 'png', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico', 'image/webp': 'webp', 'image/jpeg': 'jpg' };

async function get(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try { return await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow', signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}
function isImage(buf) {
  const h = buf.subarray(0, 12);
  const text = buf.subarray(0, 256).toString('utf8').trimStart().toLowerCase();
  return (h[0] === 0x89 && h[1] === 0x50) || (h[0] === 0 && h[1] === 0 && h[2] === 1 && h[3] === 0) || (h[0] === 0xff && h[1] === 0xd8)
    || h.toString('ascii', 0, 3) === 'GIF' || (h.toString('ascii', 0, 4) === 'RIFF' && h.toString('ascii', 8, 12) === 'WEBP')
    || text.startsWith('<svg') || (text.startsWith('<?xml') && text.includes('<svg'));
}
/** 页面声明的图标候选（apple-touch-icon > svg > 大尺寸 icon），以及 og:image（包页面的预览图通常就是图标） */
function pageCandidates(html, base) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? '';
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || !/icon/.test(rel) || /mask-icon/.test(rel)) continue;
    const size = Number(/sizes=["'](\d+)x\d+["']/i.exec(tag)?.[1] ?? 0);
    const svg = /\.svg(\?|$)/i.test(href);
    try { out.push({ url: new URL(href, base).href, score: (rel.includes('apple-touch-icon') ? 1000 : 0) + (svg ? 900 : 0) + size }); } catch { /* 忽略 */ }
  }
  out.sort((a, b) => b.score - a.score);
  const og = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
  if (og && /thunderstore/.test(base)) out.unshift({ url: og, score: 2000 });
  return out.map((c) => c.url);
}
async function tryUrl(id, url) {
  try {
    const r = await get(url);
    if (!r.ok) return null;
    const type = (r.headers.get('content-type') ?? '').split(';')[0].trim();
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 300 || /html|text\/plain/.test(type) || !isImage(buf)) return null;
    const ext = EXT[type] ?? (/\.svg/i.test(url) ? 'svg' : /\.png/i.test(url) ? 'png' : /\.ico/i.test(url) ? 'ico' : 'png');
    const file = `${id}.${ext}`;
    writeFileSync(join(OUT, file), buf);
    return { file, from: url, bytes: buf.length };
  } catch { return null; }
}

const tools = readdirSync(join('data', 'tools')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join('data', 'tools', f), 'utf8')));
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
let ok = 0;
for (const t of tools) {
  if (!FORCE && manifest[t.id] && existsSync(join('public', manifest[t.id]))) { ok++; continue; }
  const host = new URL(t.officialUrl).hostname;
  const list = [...(HINTS[t.id] ?? [])];
  if (!HOSTED.test(host)) {
    const page = await get(t.officialUrl).catch(() => null);
    if (page?.ok) list.push(...pageCandidates(await page.text(), page.url));
    list.push(`https://www.google.com/s2/favicons?domain=${host}&sz=128`);
  }
  let got = null;
  for (const u of list) if ((got = await tryUrl(t.id, u))) break;
  if (got) { manifest[t.id] = `/logos/tools/${got.file}`; ok++; console.log(`✓ ${t.id.padEnd(18)} ${got.bytes}B  ${got.from}`); }
  else console.log(`✗ ${t.id.padEnd(18)} 没有找到可靠的图标（页面会显示字母图章）`);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n工具图标：${ok}/${tools.length}`);
