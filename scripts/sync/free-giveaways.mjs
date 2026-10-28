// 自动收录其他平台的限时免费（Epic 每周免费由 epic-free.mjs 负责）：
//   1. Steam 商店「免费保留」促销：商店搜索里打到 0 元的特惠，只收游戏本体（不收 DLC / 原声），截止时间取商店页的「Free to keep … before」。
//   2. GamerPower 公开接口（gamerpower.com/api）：全网 PC 游戏赠送汇总。只保留最终落到正规商店的
//      （Epic / Steam / GOG / itch.io / IndieGala 官方页面），需要到第三方网站注册领 Key 的一律不收。
// 结果写入 data/auto/offers/；已结束超过 14 天的自动记录会被清理。
//
// 用法：node scripts/sync/free-giveaways.mjs
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, getJson, readAuto, writeAuto, today, sleep } from './lib.mjs';
import { applyOfferName } from './zh-names.mjs';

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; wanji-index-sync/1.0)' };
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const existing = readAuto('offers');
// Epic 商品页路径（/p/<slug>）也算同一活动：GamerPower 常把「Home – A Unique Horror Adventure」简写成「Home」
const epicPage = (u) => /\/p\/([^/?#]+)/.exec(u ?? '')?.[1];
const official = [...existing.values()].filter((o) => o.id.startsWith('auto-epic-'));
const seen = new Set([...official.map((o) => `${o.platform}:${norm(o.gameTitle)}`), ...official.map((o) => `epic-page:${epicPage(o.url)}`)]);
let written = 0;
let gpActive = null; // 本次 GamerPower 列表里仍在进行的 id；接口失败时为 null，不做下架清理

function save(rec) {
  const keys = [`${rec.platform}:${norm(rec.gameTitle)}`, rec.platform === 'epic' && `epic-page:${epicPage(rec.url)}`].filter(Boolean);
  if (keys.some((k) => seen.has(k))) return; // 同一活动已由别的来源收录（Epic 官方接口优先）
  keys.forEach((k) => seen.add(k));
  applyOfferName(rec);
  if (writeAuto('offers', rec)) written++;
}

const base = (id, title, platform, url, extra) => ({
  id, gameTitle: title, type: 'limited', platform, url,
  checkedAt: today(), linkHealth: 'ok', createdAt: today(), updatedAt: today(), publishStatus: 'published', ...extra,
});

// —— 1. Steam 免费保留 ——
/** 「29 Oct @ 10:00am」按太平洋时间解析成 ISO（Steam 对未登录访问按太平洋时间显示） */
function steamDeadline(s) {
  const m = /(\d{1,2}) (\w{3})(?:, (\d{4}))? @ (\d{1,2}):(\d{2})(am|pm)/i.exec(s);
  if (!m) return null;
  const mon = 'janfebmaraprmayjunjulaugsepoctnovdec'.indexOf(m[2].toLowerCase()) / 3;
  const now = new Date();
  let y = m[3] ? Number(m[3]) : now.getUTCFullYear();
  let h = Number(m[4]) % 12 + (m[6].toLowerCase() === 'pm' ? 12 : 0);
  // 太平洋时间的 UTC 偏移（夏令时 -7，冬令时 -8）
  const probe = new Date(Date.UTC(y, mon, Number(m[1]), h + 8, Number(m[5])));
  const pt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'shortOffset' }).formatToParts(probe).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-8';
  const off = -Number(/GMT([+-]\d+)/.exec(pt)?.[1] ?? -8);
  let d = new Date(Date.UTC(y, mon, Number(m[1]), h + off, Number(m[5])));
  if (!m[3] && d.getTime() < now.getTime() - 180 * 864e5) d = new Date(Date.UTC(y + 1, mon, Number(m[1]), h + off, Number(m[5])));
  return d.toISOString();
}

async function steam() {
  const r = await fetch('https://store.steampowered.com/search/results/?maxprice=free&specials=1&infinite=1&json=1&count=100&cc=us', { headers: UA }).then((x) => x.json()).catch(() => null);
  if (!r?.results_html) { console.log('  Steam 搜索暂时不可用，跳过'); return; }
  const ids = [...new Set([...r.results_html.matchAll(/data-ds-appid="(\d+)"/g)].map((m) => m[1]))];
  let n = 0;
  for (const appid of ids) {
    const d = (await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=schinese&cc=cn`))?.[appid]?.data;
    await sleep(1500);
    if (!d || d.type !== 'game') continue; // DLC、原声、软件不收
    const page = await fetch(`https://store.steampowered.com/app/${appid}/?l=english&cc=us`, { headers: { ...UA, cookie: 'birthtime=0; wants_mature_content=1' } }).then((x) => x.text()).catch(() => '');
    const keep = /Free to keep when you get it before ([^.<]+)/i.exec(page);
    if (!keep) continue; // 只要「领取后永久保留」的促销，免费周末 / 试玩不算
    const title = d.name.replace(/[™®©]/g, '').trim();
    save(base(`auto-steam-${appid}-${today().replace(/-/g, '')}`, title, 'steam', `https://store.steampowered.com/app/${appid}/`, {
      ...(/[一-鿿]/.test(title) ? { titleZh: title } : {}),
      claimNote: 'Steam 限时免费，截止前加入库中即可永久保留',
      claimNoteEn: 'Free on Steam for a limited time — add it before the deadline to keep it',
      ...(steamDeadline(keep[1]) ? { endDate: steamDeadline(keep[1]) } : {}),
      steamAppId: String(appid),
      note: '来自 Steam 商店特惠，自动更新；截止时间以 Steam 页面为准',
    }));
    n++;
  }
  console.log(`  Steam 免费保留：${n} 款`);
}

// —— 2. GamerPower ——
const HOSTS = [
  [/(^|\.)store\.epicgames\.com$/, 'epic'],
  [/(^|\.)store\.steampowered\.com$/, 'steam'],
  [/(^|\.)gog\.com$/, 'gog'],
  [/\.itch\.io$/, 'itch'],
  [/^freebies\.indiegala\.com$/, 'indiegala'],
];

const CLAIM = {
  epic: 'Epic 限时免费，领取后永久保留在库中',
  steam: 'Steam 限时免费，截止前加入库中即可永久保留',
  gog: 'GOG 限时赠送，领取后永久保留，无 DRM',
  itch: 'itch.io 限时免费，领取后加入你的 itch.io 库',
  indiegala: 'IndieGala 免费领取，需要 IndieGala 账号，无 DRM 下载',
};

const CLAIM_EN = {
  epic: 'Free on Epic for a limited time — yours to keep',
  steam: 'Free on Steam for a limited time — add it before the deadline to keep it',
  gog: 'GOG giveaway — yours to keep, DRM-free',
  itch: 'Free on itch.io for a limited time — add it to your library',
  indiegala: 'Free on IndieGala (account needed), DRM-free download',
};

async function finalUrl(u) {
  try {
    const r = await fetch(u, { method: 'GET', redirect: 'manual', headers: UA });
    return r.headers.get('location');
  } catch { return null; }
}

async function gamerpower() {
  const list = await getJson('https://www.gamerpower.com/api/giveaways?platform=pc&type=game');
  if (!Array.isArray(list)) { console.log('  GamerPower 暂时不可用，跳过'); return; }
  let n = 0, skipped = 0;
  gpActive = new Set();
  for (const g of list) {
    if (g.status !== 'Active') continue;
    gpActive.add(`auto-gp-${g.id}`);
    const url = await finalUrl(g.open_giveaway_url);
    await sleep(800);
    const host = url ? new URL(url).hostname : '';
    const platform = HOSTS.find(([re]) => re.test(host))?.[1];
    if (!platform) { skipped++; continue; } // 第三方领 Key / 需要另注册的平台不收
    const title = g.title.replace(/\s*\((?:[^()]*)\)\s*(?:Key\s+)?Giveaway\s*$/i, '').replace(/\s*(?:Key\s+)?Giveaway\s*$/i, '').trim();
    const end = g.end_date && g.end_date !== 'N/A' ? new Date(g.end_date.replace(' ', 'T') + 'Z').toISOString() : undefined;
    if (end && Date.parse(end) < Date.now()) continue; // 列表里偶尔残留已结束的活动
    const steamId = platform === 'steam' ? /\/app\/(\d+)/.exec(url)?.[1] : undefined;
    // 去掉查询参数：不带任何推广 / 追踪标记，链接只指向官方页面本身
    const clean = new URL(url.replace(/^http:/, 'https:')); clean.search = ''; clean.hash = '';
    save(base(`auto-gp-${g.id}`, title, platform, clean.toString(), {
      claimNote: CLAIM[platform],
      claimNoteEn: CLAIM_EN[platform],
      ...(end ? { endDate: end } : {}),
      ...(steamId ? { steamAppId: steamId } : {}),
      ...(g.image?.startsWith('https://') ? { art: { wide: g.image } } : {}),
      note: `由 GamerPower 赠送汇总发现，链接直达${platform === 'indiegala' ? ' IndieGala' : ''}官方页面；截止时间仅供参考，以活动页为准`,
    }));
    n++;
  }
  console.log(`  GamerPower：收录 ${n} 条，跳过需第三方注册的 ${skipped} 条`);
}

await steam();
await gamerpower();

// 清理：已结束超过 14 天的自动记录；以及 GamerPower 已下架（不再出现在列表里）且没写截止时间的
let removed = 0;
for (const [id, r] of readAuto('offers')) {
  if (!/^auto-(steam|gp)-/.test(id)) continue;
  const expired = r.endDate && Date.now() - Date.parse(r.endDate) > 14 * 864e5;
  const delisted = gpActive && id.startsWith('auto-gp-') && !gpActive.has(id) && !r.endDate;
  if (expired || delisted) { rmSync(join(AUTO, 'offers', `${id}.json`)); removed++; }
}
console.log(`其他平台免费同步完成：写入 / 更新 ${written} 条，清理过期 ${removed} 条`);
