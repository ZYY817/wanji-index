// 玩家常用中文名（config/zh-names.json）：Steam 商店没填中文名时，同步脚本用它补中文名
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const MAP = JSON.parse(readFileSync(join(ROOT, 'config', 'zh-names.json'), 'utf8'));
const CJK = /[一-鿿]/;

/** 商店名没有中文时返回对照表里的中文名，否则 null */
export function zhNameOf(appid, storeName = '') {
  if (CJK.test(storeName)) return null;
  return MAP[String(appid)] ?? null;
}

/** 把一条游戏记录的名字按对照表修正：{ zh: 中文名, en: 商店英文名 } */
export function applyGameName(rec) {
  const zh = rec.steamAppId && zhNameOf(rec.steamAppId, rec.name.zh);
  if (zh) rec.name = { zh, en: rec.name.en && CJK.test(rec.name.en) ? rec.name.zh : rec.name.en ?? rec.name.zh };
  return rec;
}

/** 免费情报：补 titleZh */
export function applyOfferName(rec) {
  const zh = rec.steamAppId && !rec.titleZh && zhNameOf(rec.steamAppId, rec.gameTitle);
  if (zh) rec.titleZh = zh;
  return rec;
}
