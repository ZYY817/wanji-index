// 自动收录 Steam 免费试玩版（Demo）：很多付费游戏提供不限时的试玩版，是独立的 Steam app。
// 数据源零成本：steam-games.mjs 刷新目录时商店 appdetails 的 demos 字段已写进游戏记录的 demoAppId，
// 这里直接把「目录里有试玩版的游戏」整理成 trial 类型的免费情报，写入 data/auto/offers/auto-trial-<baseappid>.json。
// 链接直达试玩版商店页（不是本体页）——用户点过去就能下载。
// 已有人工记录（同一 appid）的跳过；本体不再有试玩版时自动移除。
//
// 用法：node scripts/sync/free-trials.mjs
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, readAuto, readHand, writeAuto, today } from './lib.mjs';
import { applyOfferName } from './zh-names.mjs';

const appOf = (u) => /store\.steampowered\.com\/app\/(\d+)/.exec(u ?? '')?.[1];
const handApps = new Set(readHand('offers').map((o) => o.steamAppId ?? appOf(o.url)).filter(Boolean).map(String));

// 目录里带试玩版的游戏（人工 + 自动）
const withDemo = new Map(); // baseAppid → { demoAppId, zh, en }
for (const g of [...readHand('games'), ...readAuto('games').values()]) {
  if (!g.demoAppId) continue;
  const base = String(g.steamAppId ?? appOf(g.channels?.[0]?.url) ?? '');
  if (base && !withDemo.has(base)) withDemo.set(base, { demoAppId: String(g.demoAppId), zh: g.name?.zh ?? '', en: g.name?.en ?? '' });
}

const keep = new Set();
let written = 0;
for (const [base, d] of withDemo) {
  if (handApps.has(base)) continue;
  const id = `auto-trial-${base}`;
  keep.add(id);
  const gameTitle = d.en && d.zh && d.en !== d.zh ? `${d.en} ${d.zh}` : (d.zh || d.en);
  if (!gameTitle) continue;
  const rec = {
    id,
    gameTitle,
    ...(/[一-鿿]/.test(d.zh) ? { titleZh: d.zh } : {}),
    type: 'trial',
    platform: 'steam',
    url: `https://store.steampowered.com/app/${d.demoAppId}/`,
    claimNote: 'Steam 免费试玩版，内容为本体的一部分，不限时间',
    claimNoteEn: 'Free demo on Steam — a slice of the full game, no time limit',
    steamAppId: base,
    checkedAt: today(),
    linkHealth: 'ok',
    note: '试玩版信息来自 Steam 商店接口，自动更新；试玩进度通常不继承到正式版',
    createdAt: today(), updatedAt: today(),
    publishStatus: 'published',
  };
  applyOfferName(rec);
  if (writeAuto('offers', rec)) written++;
}

// 本体不再有试玩版 / 跌出目录的自动记录移除
let removed = 0;
for (const id of readAuto('offers').keys())
  if (id.startsWith('auto-trial-') && !keep.has(id)) { rmSync(join(AUTO, 'offers', `${id}.json`)); removed++; }

console.log(`免费试玩版同步完成：目录含试玩版 ${withDemo.size} 款，写入 / 更新 ${written} 条，移除 ${removed} 条`);
