// 免费情报的封面图自动获取：没有美术（art）也没有 Steam appid 的情报（官网 / Epic 链接为主），依次尝试：
//   1. Steam 商店搜索同名游戏——名字完全对得上才采用，用 Steam 官方多尺寸美术；
//   2. 官方页面的分享图（og:image / twitter:image），确认是可访问的图片才采用；
//   3. 都没有就保留占位封面。
// 结果写入 data/auto/offer-art.json（{ 情报 id: { steamAppId | wide, source } }），不改动人工整理的情报文件；
// 构建时 src/lib/present.ts 读它作为最后一档美术来源。
//
// 用法：node scripts/sync/offer-art.mjs [--force]
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, ROOT, getJson, sleep } from './lib.mjs';

const OUT = join(AUTO, 'offer-art.json');
const FORCE = process.argv.includes('--force');
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' };
const norm = (s) => String(s ?? '').toLowerCase().replace(/[™®©:'’\-–—.!]/g, '').replace(/\s+/g, ' ').trim();
const appOf = (u) => /store\.steampowered\.com\/app\/(\d+)/.exec(u ?? '')?.[1];

const offers = ['offers', join('auto', 'offers')].flatMap((d) => {
  const dir = join(ROOT, 'data', d);
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))) : [];
});

/** 情报标题里的英文名：「Genshin Impact 原神」→「Genshin Impact」 */
const enName = (o) => (o.titleZh ? o.gameTitle.replace(o.titleZh, '') : o.gameTitle).replace(/[（(].*?[)）]/g, '').trim();

async function steamMatch(name) {
  const j = await getJson(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(name)}&l=english&cc=US`);
  const hit = (j?.items ?? []).find((it) => norm(it.name) === norm(name));
  return hit ? String(hit.id) : null;
}

async function ogImage(url) {
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (!r.ok) return null;
    const html = await r.text();
    const m = /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*content=["']([^"']+)["']/i.exec(html)
      ?? /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i.exec(html);
    if (!m) return null;
    const img = new URL(m[1], r.url).toString().replace(/^http:/, 'https:');
    // 只要真正可访问的大图：排除 favicon，确认返回的是图片
    if (/favicon|\.ico($|\?)/i.test(img)) return null;
    const head = await fetch(img, { method: 'GET', headers: UA, signal: AbortSignal.timeout(20000) });
    return head.ok && /^image\//.test(head.headers.get('content-type') ?? '') ? img : null;
  } catch { return null; }
}

const out = {};
let steam = 0, og = 0, none = 0;
for (const o of offers) {
  if (o.art || o.steamAppId || appOf(o.url) || o.gameId) continue;
  if (!FORCE && old[o.id]) { out[o.id] = old[o.id]; continue; }
  const name = enName(o);
  const app = name ? await steamMatch(name) : null;
  await sleep(1200);
  if (app) { out[o.id] = { steamAppId: app, source: 'steam-search' }; steam++; continue; }
  const img = await ogImage(o.url);
  if (img) { out[o.id] = { wide: img, source: 'og:image' }; og++; continue; }
  none++;
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`免费情报封面：Steam 同名 ${steam}，官网分享图 ${og}，仍用占位 ${none}`);
