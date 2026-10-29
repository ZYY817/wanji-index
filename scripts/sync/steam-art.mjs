// Steam 美术的真实地址：较新的游戏把图片放在带哈希的目录里（store_item_assets/steam/apps/<appid>/<hash>/header.jpg），
// 按旧规则拼出的 steam/apps/<appid>/header.jpg 会 404。这里用 Steam 官方的 IStoreBrowseService/GetItems
// （公开接口，无需密钥）批量取每个 appid 的 header / 竖版海报 / 横幅 / 胶囊图，写入 data/auto/steam-art.json；
// src/lib/data.mjs 的 steamArtById 优先用它，没有时才按旧规则拼。
//
// 范围：所有游戏 + 带 Steam appid 的免费情报（含 offer-art.json 里自动找到的）。
// 用法：node scripts/sync/steam-art.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, ROOT, getJson, sleep } from './lib.mjs';

const OUT = join(AUTO, 'steam-art.json');
const BASE = 'https://shared.akamai.steamstatic.com/store_item_assets/';

function jsonFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))) : [];
}
const appOf = (r) => r.steamAppId ?? /store\.steampowered\.com\/app\/(\d+)/.exec(r.url ?? r.channels?.find((c) => c.platform === 'steam')?.url ?? '')?.[1];

const ids = new Set();
for (const g of [...jsonFiles(join(ROOT, 'data', 'games')), ...jsonFiles(join(AUTO, 'games'))]) { const a = appOf(g); if (a) ids.add(String(a)); }
for (const o of [...jsonFiles(join(ROOT, 'data', 'offers')), ...jsonFiles(join(AUTO, 'offers'))]) { const a = appOf(o); if (a) ids.add(String(a)); }
const found = existsSync(join(AUTO, 'offer-art.json')) ? JSON.parse(readFileSync(join(AUTO, 'offer-art.json'), 'utf8')) : {};
for (const v of Object.values(found)) if (v.steamAppId) ids.add(String(v.steamAppId));

const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const out = {};
const list = [...ids];
let ok = 0;
for (let i = 0; i < list.length; i += 50) {
  const batch = list.slice(i, i + 50);
  const input = { ids: batch.map((a) => ({ appid: Number(a) })), context: { language: 'schinese', country_code: 'CN' }, data_request: { include_assets: true } };
  const j = await getJson(`https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(JSON.stringify(input))}`);
  const items = j?.response?.store_items;
  if (!Array.isArray(items)) { console.log('  Steam 资源接口暂时不可用，沿用旧数据'); break; }
  items.forEach((it) => {
    const a = it.assets;
    const appid = String(it.id); // 按请求的 id 对应（不靠返回顺序；合集类 appid 返回的 appid 可能不同）
    if (!a?.asset_url_format) return;
    // 去掉 ?t= 时间戳：地址稳定，内容不变时不产生无意义的提交
    const url = (file) => (file ? BASE + a.asset_url_format.replace('${FILENAME}', file).replace(/\?t=\d+$/, '') : undefined);
    const art = {
      // 标准尺寸：游戏库一次显示几十张，2x 图太重（header 460×215、海报 600×900、横幅 1920×620）
      header: url(a.header ?? a.header_2x),
      poster: url(a.library_capsule ?? a.library_capsule_2x),
      hero: url(a.library_hero ?? a.library_hero_2x) ?? url(a.hero_capsule),
      capsule: url(a.main_capsule ?? a.main_capsule_2x),
    };
    Object.keys(art).forEach((key) => art[key] === undefined && delete art[key]);
    if (Object.keys(art).length) { out[appid] = art; ok++; }
  });
  await sleep(1200);
}
// 接口失败的批次：保留上一次的结果
for (const [k, v] of Object.entries(old)) if (!out[k]) out[k] = v;
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => Number(a) - Number(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Steam 美术地址：${list.length} 个 appid，取到 ${ok} 个`);
