// 免费情报的中文名与类型：限时领取（GamerPower / itch.io / Epic）抓到的大多只有英文名。
// 对每条还没有中文名的情报：
//   1. 找到 Steam appid（情报自带 → 商店链接 → 封面脚本找到的 → Steam 搜索「名字完全一致」）；
//   2. 读 Steam 简体中文商店信息：官方中文名（名字里有汉字才采用）+ 官方类型；
//   3. 查不到就什么都不写——没有通行中文名的独立游戏保留英文原名，不硬译。
// 结果写入 data/auto/offer-names.json（{ 情报 id: { steamAppId, zh?, genres } }），不改动情报文件；
// 构建时 src/lib/present.ts 用它补 titleZh，并在没有中文名时用中文类型做副标题。
//
// 用法：node scripts/sync/offer-names.mjs [--force]
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, ROOT, getJson, sleep } from './lib.mjs';

const OUT = join(AUTO, 'offer-names.json');
const FORCE = process.argv.includes('--force');
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const ART = existsSync(join(AUTO, 'offer-art.json')) ? JSON.parse(readFileSync(join(AUTO, 'offer-art.json'), 'utf8')) : {};
const CJK = /[一-鿿]/;
// Steam 类型编号 → 站内类型（与 steam-games.mjs 一致）
const GENRE = { 1: 'action', 2: 'strategy', 3: 'rpg', 25: 'adventure', 28: 'simulation', 9: 'racing', 18: 'sports', 4: 'casual', 29: 'mmo', 23: 'indie' };
const norm = (s) => String(s ?? '').toLowerCase().replace(/[™®©:'’\-–—.!,]/g, '').replace(/\s+/g, ' ').trim();
const appOf = (u) => /store\.steampowered\.com\/app\/(\d+)/.exec(u ?? '')?.[1];

const offers = ['offers', join('auto', 'offers')].flatMap((d) => {
  const dir = join(ROOT, 'data', d);
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))) : [];
});

async function steamSearch(name) {
  const j = await getJson(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(name)}&l=english&cc=US`);
  return (j?.items ?? []).find((it) => norm(it.name) === norm(name))?.id ?? null;
}

const out = {};
let named = 0, typed = 0, none = 0;
for (const o of offers) {
  // 已有中文名、或关联了游戏档案（用档案的名字）的情报不需要
  if (o.titleZh || o.gameId || CJK.test(o.gameTitle ?? '')) continue;
  if (!FORCE && old[o.id]) { out[o.id] = old[o.id]; continue; }
  let app = o.steamAppId ?? appOf(o.url) ?? ART[o.id]?.steamAppId ?? null;
  if (!app) { app = await steamSearch(o.gameTitle); await sleep(1200); }
  if (!app) { none++; continue; }
  const j = await getJson(`https://store.steampowered.com/api/appdetails?appids=${app}&l=schinese&cc=cn`);
  await sleep(1200);
  const d = j?.[app]?.success ? j[app].data : null;
  if (!d) { none++; continue; }
  const zh = String(d.name ?? '').replace(/[™®©]/g, '').replace(/^《(.+)》$/, '$1').trim();
  const genres = [...new Set((d.genres ?? []).map((g) => GENRE[g.id]).filter(Boolean))].slice(0, 3);
  out[o.id] = { steamAppId: String(app), ...(CJK.test(zh) ? { zh } : {}), genres };
  CJK.test(zh) ? named++ : typed++;
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
console.log(`免费情报中文名：官方中文名 ${named}，仅有类型 ${typed}，Steam 上查不到 ${none}`);
