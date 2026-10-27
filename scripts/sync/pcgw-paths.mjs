// 自动补全存档位置 / 配置文件位置：来自 PCGamingWiki（内容协议 CC BY-NC-SA——本站非商业使用，逐条署名并链接原页面）。
// 对 data/auto/games 里的每款游戏：按英文名找到 PCGamingWiki 页面 → 用页面里的 Steam appid 确认是同一款 →
// 取 Windows 的存档 / 配置路径，把 {{p|appdata}} 这类占位写成 %APPDATA% 等玩家熟悉的写法，写回该游戏的自动记录。
// 人工已填存档位置的游戏，合并时仍以人工为准（见 src/lib/merge-auto.mjs）。
//
// 用法：node scripts/sync/pcgw-paths.mjs [--limit 20] [--force]（先运行 steam-games.mjs）
import { config, getJson, readAuto, writeAuto, sleep, today } from './lib.mjs';

const cfg = config().pcgamingwiki;
const limitArg = process.argv.indexOf('--limit');
const MAX = limitArg > 0 ? Number(process.argv[limitArg + 1]) : cfg.maxPerRun;
const FORCE = process.argv.includes('--force'); // 忽略刷新间隔，全部重新拉取（新增抓取字段时用）
const API = 'https://www.pcgamingwiki.com/w/api.php';

// PCGamingWiki 的路径占位 → Windows 常见写法
const P = {
  appdata: '%APPDATA%', localappdata: '%LOCALAPPDATA%', userprofile: '%USERPROFILE%', 'userprofile\\documents': '%USERPROFILE%\\Documents',
  'userprofile\\appdata\\locallow': '%USERPROFILE%\\AppData\\LocalLow', public: '%PUBLIC%', programdata: '%PROGRAMDATA%',
  windir: '%WINDIR%', game: '<游戏安装目录>', steam: '<Steam 安装目录>', uid: '<用户 ID>', username: '<用户名>',
  hkcu: 'HKEY_CURRENT_USER', hklm: 'HKEY_LOCAL_MACHINE', wow64: 'WOW6432Node', ubisoftconnect: '<Ubisoft Connect 安装目录>',
};

function cleanPath(raw) {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '').replace(/<ref[\s\S]*?<\/ref>|<ref[^>]*\/>/g, '')
    .replace(/\{\{p\|([^}]+)\}\}/gi, (_, k) => P[k.toLowerCase()] ?? `<${k}>`)
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\s+/g, ' ').trim();
}

/** 页面 wikitext 里的 Windows 存档 / 配置路径 */
function extract(wikitext) {
  const out = { saves: [], config: [] };
  for (const m of wikitext.matchAll(/\{\{Game data\/(saves|config)\|Windows\|((?:[^{}]|\{\{[^{}]*\}\})*)\}\}/gi)) {
    // 先把 {{p|xxx}} 占位换掉再按 | / <br> 拆分，否则占位里的 | 会把路径切断
    const body = m[2].replace(/\{\{p\|([^}]+)\}\}/gi, (_, k) => P[k.toLowerCase()] ?? `<${k}>`);
    for (const part of body.split(/<br\s*\/?>|\|/i)) {
      const p = cleanPath(part);
      if (p && /[\\%<]|HKEY/.test(p) && !out[m[1].toLowerCase()].includes(p)) out[m[1].toLowerCase()].push(p);
    }
  }
  return out;
}

/** 「Issues fixed / Issues unresolved」两节下的三级标题 = 这款游戏的已知问题（只取标题，正文不转载，链接到原文锚点） */
function issuesOf(wikitext, pageUrl) {
  const out = [];
  let section = null;
  for (const line of wikitext.split('\n')) {
    const h2 = /^==([^=].*?)==\s*$/.exec(line);
    if (h2) { section = /issues fixed/i.test(h2[1]) ? 'fixed' : /issues unresolved/i.test(h2[1]) ? 'open' : null; continue; }
    const h3 = section && /^===([^=].*?)===\s*$/.exec(line);
    if (!h3) continue;
    const title = h3[1].replace(/\{\{[^}]*\}\}/g, '').replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    // 有的页面在问题小节下按平台再分组（=== Windows ===），这类标题不是问题本身；只出现在 Linux / macOS / Steam Deck 上的问题也不收（本站面向 Windows 玩家）
    if (!title || /^(windows|linux|macos|os x|mac os x|steam deck|general)$/i.test(title) || /\b(linux|macos|os x|steam deck|proton|wine)\b/i.test(title)) continue;
    out.push({ title, url: `${pageUrl}#${encodeURIComponent(title.replace(/ /g, '_'))}`, fixed: section === 'fixed' });
  }
  return out.slice(0, 30);
}

async function wikitextOf(title) {
  const j = await getJson(`${API}?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&redirects=1&format=json`);
  return j?.parse ? { title: j.parse.title, text: j.parse.wikitext['*'] } : null;
}
const appidMatches = (text, appid) => new RegExp(`steam appid\\s*=\\s*[^\\n]*\\b${appid}\\b`, 'i').test(text);

async function findPage(names, appid) {
  // 1) 名字直接当页面标题：商店当前名（全英文时）优先，其次英文名——同一 appid 可能换过名（CS:GO → CS2）；
  // 2) 站内搜索前 3 个结果。都要求页面里的 Steam appid 对得上
  const titles = [...new Set(names.filter(Boolean).map((n) => n.replace(/[™®©]/g, '').trim()))];
  const s = await getJson(`${API}?action=query&list=search&srsearch=${encodeURIComponent(titles[0])}&srlimit=3&format=json`);
  for (const r of s?.query?.search ?? []) if (!titles.includes(r.title)) titles.push(r.title);
  for (const t of titles) {
    const page = await wikitextOf(t);
    await sleep(cfg.requestIntervalMs);
    if (page && appidMatches(page.text, appid)) return page;
  }
  return null;
}

const games = [...readAuto('games').values()];
const stale = (g) => !g._auto?.pcgw?.syncedAt || (Date.now() - Date.parse(g._auto.pcgw.syncedAt)) / 864e5 > cfg.refreshDays;
let done = 0, found = 0, miss = 0;
for (const g of games) {
  if (done >= MAX) break;
  if (!g.steamAppId || (!FORCE && !stale(g))) continue;
  done++;
  const page = await findPage([/^[ -~]+$/.test(g.name.zh) ? g.name.zh : null, g.name.en, g.name.zh], g.steamAppId);
  const rec = { ...g, _auto: { ...g._auto, pcgw: { syncedAt: new Date().toISOString(), page: page?.title ?? null } } };
  if (page) {
    const { saves, config } = extract(page.text);
    const url = `https://www.pcgamingwiki.com/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`;
    const note = '来源：PCGamingWiki';
    if (saves.length) rec.savePaths = saves.map((path) => ({ os: 'windows', path, note }));
    if (config.length) rec.configPaths = config.map((path) => ({ os: 'windows', path, note }));
    const issues = issuesOf(page.text, url);
    if (issues.length) rec.issues = issues; else delete rec.issues;
    if ((saves.length || config.length || issues.length) && !rec.sources.some((x) => x.url === url)) rec.sources = [...rec.sources, { name: 'PCGamingWiki', url }];
    if (saves.length || config.length) found++; else miss++;
  } else miss++;
  rec.updatedAt = today();
  writeAuto('games', rec);
  if (done % 20 === 0) console.log(`  已处理 ${done}：找到路径 ${found}，未找到 ${miss}`);
}
console.log(`PCGamingWiki 同步完成：处理 ${done} 款，补上路径 ${found} 款，未找到 ${miss} 款`);
