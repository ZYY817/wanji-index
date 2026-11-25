// 自动收录 Steam 周末免费试玩（Free Weekend / Free Play Days）：
// 付费游戏在限定期限内免费开放游玩，结束后恢复收费——与「免费保留」和「永久免费」都不同。
//
// 为什么需要专门的发现通道：Steam 官方文档明确说周末免费「默认不在商店任何地方推广，
// 只在游戏自己的商店页显示」，所以没有官方列表接口。本脚本分两层：
//
//   发现（找候选）：
//     1. 商店首页橱窗（featuredcategories）：Valve 有时直接把周免放在橱窗，名字就叫 "Free Weekend"；
//     2. 打折扫描：周免「通常与折扣促销同时进行」（Steamworks 文档），扫商店特惠榜前列的游戏；
//     3. 站内目录游戏：已收录游戏的周免对站内用户价值最高，无论打不打折都扫一遍。
//   验证（确认+取截止时间）：
//     逐个访问候选的商店页，读页面内嵌 JSON 里的 "free_weekend" / "is_free_temporarily" 字段——
//     这是商店前端自己的数据源，有周免时 free_weekend 非 null。只有确认了的才会写入。
//     截止时间优先取页面里的时间戳，取不到按 Steamworks 文档的标准结束时间（下周一太平洋时间 10:00）兜底并记日志。
//
// 写入 data/auto/offers/auto-wknd-<appid>.json（type: weekend）；已有人工记录（同一 appid）的跳过；
// 结束后超过 14 天的记录会被清理。扫描范围在 config/sync.json 的 freeweekend 段调整。
//
// 用法：node scripts/sync/free-weekends.mjs [--limit N] [--probe <appid>]
//   --limit N   只扫描前 N 个打折候选（调试用）
//   --probe     打印某个 appid 商店页里 free_weekend 的原始值，用于校准解析器
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, getJson, readAuto, readHand, writeAuto, today, sleep, config } from './lib.mjs';
import { applyOfferName } from './zh-names.mjs';

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; wanji-index-sync/1.0)', cookie: 'birthtime=0; wants_mature_content=1' };
const ADULT = new Set([1, 3]);
const cfg = config().freeweekend ?? {};
const SCAN_SPECIALS = cfg.scanSpecialsTop ?? 80;
const SCAN_CATALOG = cfg.scanCatalog !== false;
const INTERVAL = cfg.requestIntervalMs ?? 1800;

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;
const probeArg = process.argv.indexOf('--probe');
const PROBE = probeArg > 0 ? process.argv[probeArg + 1] : null;

// —— 商店页抓取与解析 ——

async function storePage(appid) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(`https://store.steampowered.com/app/${appid}/?l=english&cc=us`, { headers: UA });
      if (r.status === 429) { console.log(`  ${appid}：被限速，等待后重试`); await sleep(15000); continue; }
      if (!r.ok) return null;
      return await r.text();
    } catch { await sleep(3000); }
  }
  return null;
}

/** 页面内嵌 JSON 是 HTML 实体编码的（&quot;），解码关键段落 */
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/**
 * 从商店页判断周免状态。返回 { active, rawEnd, rawValue } 或 null（无法判断）。
 * active 的依据：内嵌 JSON 里 "free_weekend" 非 null/false，或 "is_free_temporarily" 为真。
 */
function weekendState(page) {
  if (!page) return null;
  const html = decode(page);
  const fw = /"free_weekend"\s*:\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|"[^"]*"|true|false|null|\d+)/.exec(html);
  const temp = /"is_free_temporarily"\s*:\s*(true|false|null|1|0)/.exec(html);
  if (!fw && !temp) return null; // 页面结构变了，无法判断
  const fwVal = fw?.[1] ?? 'null';
  const fwActive = !!fw && fwVal !== 'null' && fwVal !== 'false';
  const tempActive = !!temp && (temp[1] === 'true' || temp[1] === '1');
  // 截止线索：free_weekend 对象里找 end/expire 之类的时间戳（精确结构待真实案例校准，先宽匹配）
  let rawEnd = null;
  if (fwActive && fwVal.startsWith('{')) {
    const m = /"(?:end|ends|expire[sd]?|endtime|end_time|end_date|enddate|deadline)[a-z_]*"\s*:\s*"?(\d{9,}[^"]*|[^",}]+)"?/i.exec(fwVal);
    if (m) rawEnd = m[1];
  }
  return { active: fwActive || tempActive, rawEnd, rawValue: fwVal.slice(0, 300) };
}

/** 太平洋时间下一个周一 10:00（Steamworks 文档里的标准周免结束时间）；若本周一 10 点还没到就取本周一 */
function nextMondayPT() {
  // 先在太平洋时间的墙钟上算出目标日期，再换算成 UTC
  const pt = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const daysUntilMonday = (8 - pt.getDay()) % 7; // 周一当天为 0
  const target = new Date(pt);
  target.setDate(pt.getDate() + daysUntilMonday + (daysUntilMonday === 0 && pt.getHours() >= 10 ? 7 : 0));
  target.setHours(10, 0, 0, 0);
  // 太平洋 → UTC：查该时区的偏移（夏令时 -7，冬令时 -8）
  const probe = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'shortOffset' }).formatToParts(target).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-8';
  const off = Number(/GMT([+-]\d+)/.exec(probe)?.[1] ?? -8); // 如 -8
  return new Date(Date.UTC(target.getFullYear(), target.getMonth(), target.getDate(), target.getHours() - off)).toISOString();
}

/** 把 rawEnd 线索尽力解析成 ISO；失败返回 null */
function parseEnd(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 1e9) return new Date(n < 1e12 ? n * 1000 : n).toISOString();
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

// —— probe 调试模式 ——
if (PROBE) {
  const page = await storePage(PROBE);
  const st = weekendState(page);
  console.log(`probe ${PROBE}:`, JSON.stringify(st, null, 2));
  process.exit(0);
}

// —— 1. 发现候选 ——

const candidates = new Map(); // appid → 来源说明
const add = (appid, src) => { if (appid && !candidates.has(String(appid))) candidates.set(String(appid), src); };

// 1a. 商店橱窗里直接叫 "Free Weekend" 的
const featured = await getJson('https://store.steampowered.com/api/featuredcategories?cc=us&l=english');
let spotlightCount = 0;
for (const v of Object.values(featured ?? {})) {
  if (v?.id !== 'cat_spotlight') continue;
  for (const it of v.items ?? []) {
    if (/free\s*(weekend|play)/i.test(it.name ?? '') || /免费试玩/.test(it.name ?? '')) {
      const a = /\/app\/(\d+)/.exec(it.url ?? '')?.[1];
      if (a) { add(a, '橱窗'); spotlightCount++; }
    }
  }
}
console.log(`  橱窗候选：${spotlightCount} 款`);

// 1b. 打折扫描：周免通常伴随折扣（Steamworks 文档）
const sr = await fetch(`https://store.steampowered.com/search/results/?specials=1&infinite=1&json=1&count=${Math.min(SCAN_SPECIALS, 100)}&cc=us`, { headers: UA }).then((x) => x.json()).catch(() => null);
const saleIds = sr?.results_html ? [...new Set([...sr.results_html.matchAll(/data-ds-appid="(\d+)"/g)].map((m) => m[1]))] : [];
for (const a of saleIds) add(a, '打折');
console.log(`  打折候选：${saleIds.length} 款`);

// 1c. 站内目录里的付费 Steam 游戏（人工 + 自动）
if (SCAN_CATALOG) {
  let n = 0;
  const appOf = (u) => /store\.steampowered\.com\/app\/(\d+)/.exec(u ?? '')?.[1];
  for (const g of readHand('games')) {
    const ch = (g.channels ?? []).find((c) => c.platform === 'steam');
    if (ch?.type === 'buy') { add(appOf(ch.url) ?? String(g.steamAppId ?? ''), '目录'); n++; }
  }
  for (const g of readAuto('games').values()) {
    const ch = (g.channels ?? []).find((c) => c.platform === 'steam');
    if (ch?.type === 'buy') { add(String(g.steamAppId ?? appOf(ch.url) ?? ''), '目录'); n++; }
  }
  console.log(`  目录付费游戏候选：${n} 款`);
}

// 已有人工免费情报覆盖的 appid 跳过（人工为准）
const handApps = new Set();
for (const o of readHand('offers')) {
  const a = o.steamAppId ?? /store\.steampowered\.com\/app\/(\d+)/.exec(o.url ?? '')?.[1];
  if (a) handApps.add(String(a));
}

console.log(`候选合计 ${candidates.size} 款，开始逐页验证（间隔 ${INTERVAL}ms）`);

// —— 2. 逐页验证 ——

const confirmed = new Set();
let written = 0, scanned = 0, checked = 0;
for (const [appid, src] of candidates) {
  if (scanned >= LIMIT) break;
  if (handApps.has(appid)) continue;
  scanned++;
  const page = await storePage(appid);
  await sleep(INTERVAL);
  if (!page) continue;
  const st = weekendState(page);
  if (!st) { console.log(`  ${appid}：页面结构无法判断（可能改版），跳过`); continue; }
  if (!st.active) continue;
  checked++;
  console.log(`  确认周免：${appid}（来源 ${src}），free_weekend 原始值：${st.rawValue}`);

  // 成人内容排除 + 取中文名
  const d = (await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=schinese&cc=cn`))?.[appid]?.data;
  await sleep(1500);
  if (!d || d.type !== 'game') continue;
  if ((d.content_descriptors?.ids ?? []).some((x) => ADULT.has(x))) continue;

  const end = parseEnd(st.rawEnd);
  const endDate = end ?? nextMondayPT();
  if (!end) console.log(`  ${appid}：页面未取到截止时间，按标准时间（下周一太平洋 10:00）兜底`);
  if (Date.parse(endDate) < Date.now()) continue; // 已结束的不收（页面缓存滞后的情况）

  const clean = (s) => String(s ?? '').replace(/[™®©]/g, '').replace(/^《(.+)》$/, '$1').trim();
  const title = clean(d.name);
  const rec = {
    id: `auto-wknd-${appid}`,
    gameTitle: title,
    ...(/[一-鿿]/.test(title) ? { titleZh: title } : {}),
    type: 'weekend',
    platform: 'steam',
    url: `https://store.steampowered.com/app/${appid}/`,
    claimNote: 'Steam 限时免费游玩，期限内可完整体验；结束后需购买才能继续',
    claimNoteEn: 'Free to play on Steam for a limited time — purchase required to keep playing after it ends',
    endDate,
    steamAppId: String(appid),
    checkedAt: today(),
    linkHealth: 'ok',
    note: `来自 Steam 商店页周免信息（${src}渠道发现），自动更新；截止时间以商店页为准`,
    createdAt: today(), updatedAt: today(),
    publishStatus: 'published',
  };
  applyOfferName(rec);
  if (writeAuto('offers', rec)) written++;
  confirmed.add(`auto-wknd-${appid}`);
}

// —— 3. 清理 ——
// 结束超过 14 天的删掉；仍在截止期内但本次扫描没确认的保留（扫描范围有限，不误杀）
let removed = 0;
for (const [id, r] of readAuto('offers')) {
  if (!id.startsWith('auto-wknd-')) continue;
  if (r.endDate && Date.now() - Date.parse(r.endDate) > 14 * 864e5) { rmSync(join(AUTO, 'offers', `${id}.json`)); removed++; }
}

console.log(`周末试玩同步完成：扫描 ${scanned} 款，确认进行中 ${checked} 款，写入 / 更新 ${written} 条，清理过期 ${removed} 条`);
