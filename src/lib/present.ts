import OFFER_ART from '../../data/auto/offer-art.json';
import OFFER_NAMES from '../../data/auto/offer-names.json';
// 展示层视图模型（仅服务端调用）：把 loadData()/buildRelations() 的结果整理成可序列化的 props，
// 供客户端组件使用。只做「整形与计数」，不做资格过滤（资格唯一判定在 eligibility.mjs）。
import { steamArt, steamArtById, steamAppIdFromUrl } from './data.mjs';
import { computeLifecycle } from './lifecycle.mjs';
import { domainOf } from './utils';
import { withBase } from './base';
import site from '../../config/site.json';

export type Art = { appid: string; header: string; poster: string; hero: string; logo: string; capsule: string } | null;

export type GameVM = {
  id: string; slug: string; name: string; en?: string; aliases: string[]; summary: string;
  publisher?: string;
  genres: string[]; os: string[]; platforms: string[]; art: Art;
  counts: { channels: number; entries: number; tools: number; guides: number; faqs: number; paths: number; total: number };
  updatedAt: string; checkedAt: string; hasOffer: boolean;
  releasedAt: number | null; isNew: boolean;
};

export type SiteVM = {
  id: string; slug: string; name: string; en?: string; aliases: string[]; summary: string; category: string;
  url: string; domain: string; languages: string[]; feeNote?: string; linkHealth: string;
  reviewStatus: string; entryCount: number; gameCount: number; checkedAt: string; purposes: string[];
};

export type OfferVM = {
  id: string; title: string; type: string; platform: string; url: string; claimNote?: string; note?: string;
  startDate?: string; endDate?: string; startMs: number | null; endMs: number | null;
  checkedAt: string; linkHealth: string; lifecycle: string | null;
  gameSlug?: string; gameName?: string; art: Art;
  /** 官方中文名（没有则为空）与去掉中文名后的原名，用于「中文主标题 + 原名副标题」 */
  titleZh?: string; titleOrig?: string; claimNoteEn?: string;
  /** 类型（站内类型键）：没有中文名的情报用它做中文副标题 */
  genres: string[];
};

/** 从 releaseDate 解析出时间戳（毫秒）或 null，兼容中英文与即将推出 */
export function parseReleaseDate(str: string | undefined): number | null {
  if (!str) return null;
  const s = str.trim();
  if (!s) return null;

  if (/即将|coming soon|tba|tbd/i.test(s)) {
    const y = /(\d{4})/.exec(s);
    if (y) return Date.parse(`${y[1]}-12-31T00:00:00+08:00`);
    return Date.now() + 365 * 864e5;
  }

  const zhFull = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/.exec(s);
  if (zhFull) {
    const t = Date.parse(`${zhFull[1]}-${zhFull[2].padStart(2, '0')}-${zhFull[3].padStart(2, '0')}T00:00:00+08:00`);
    if (!Number.isNaN(t)) return t;
  }

  const zhYm = /(\d{4})\s*年\s*(\d{1,2})\s*月/.exec(s);
  if (zhYm) {
    const t = Date.parse(`${zhYm[1]}-${zhYm[2].padStart(2, '0')}-01T00:00:00+08:00`);
    if (!Number.isNaN(t)) return t;
  }

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) return parsed;

  return null;
}

/** 发售 ≤ 180 天，或"即将推出" */
export function isNewGame(releaseDate: string | undefined, releasedAt: number | null, now = Date.now()): boolean {
  if (releaseDate && /即将|coming soon|tba|tbd/i.test(releaseDate)) return true;
  if (releasedAt == null) return false;
  const diffDays = (now - releasedAt) / 864e5;
  return diffDays <= 180;
}

export function gameVM(g: any, rel: any): GameVM {
  const entries = rel.entriesByGame.get(g.id) ?? [];
  const tools = rel.toolsByGame.get(g.id) ?? [];
  const guides = rel.guidesByGame.get(g.id) ?? [];
  const offers = rel.offersByGame.get(g.id) ?? [];
  const counts = {
    channels: g.channels.length,
    entries: entries.length,
    tools: tools.length,
    guides: guides.length,
    faqs: (g.faqs ?? []).length,
    paths: (g.savePaths ?? []).length + (g.configPaths ?? []).length,
    total: 0,
  };
  counts.total = counts.channels + counts.entries + counts.tools + counts.guides + counts.paths;
  return {
    id: g.id, slug: g.slug, name: g.name.zh, en: g.name.en, aliases: g.aliases ?? [], summary: g.summary,
    publisher: g.publisher ?? undefined,
    genres: g.genres ?? [], os: g.os ?? [],
    platforms: [...new Set<string>(g.channels.map((c: any) => c.platform))],
    art: steamArt(g), counts, updatedAt: g.updatedAt, checkedAt: g.checkedAt,
    hasOffer: offers.length > 0,
    releasedAt: parseReleaseDate(g.releaseDate),
    isNew: isNewGame(g.releaseDate, parseReleaseDate(g.releaseDate)),
  };
}

export function siteVM(s: any, rel: any): SiteVM {
  const games = new Set((rel.gamesBySite.get(s.id) ?? []).map((g: any) => g.id));
  return {
    id: s.id, slug: s.slug, name: s.name, aliases: s.aliases ?? [], summary: s.summary, category: s.category,
    url: s.url, domain: domainOf(s.url), languages: s.languages ?? [], feeNote: s.feeNote,
    linkHealth: s.linkHealth, reviewStatus: s.reviewStatus, purposes: s.purposes ?? [],
    entryCount: (rel.entriesBySite.get(s.id) ?? []).length, gameCount: games.size, checkedAt: s.checkedAt,
  };
}

/** 与 lifecycle.mjs 同一时间口径：纯日期按 Asia/Shanghai 当日起止 */
export function offerMs(str: string | undefined, isEnd: boolean): number | null {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return Date.parse(str + (isEnd ? 'T23:59:59' : 'T00:00:00') + '+08:00');
  const t = Date.parse(str);
  return Number.isNaN(t) ? null : t;
}

const CJK = /[一-鿿]/;
/**
 * 情报的中英文名（中文主标题 + 英文原名副标题）：
 *   情报自带 titleZh → 关联游戏档案的中文名 → Steam 简体中文商店的官方中文名（scripts/sync/offer-names.mjs）。
 *   都没有就不给 titleZh——没有通行中文名的独立游戏保留英文原名，界面改用中文类型做副标题，不硬译。
 * 类型：关联游戏的类型 → Steam 官方类型；「独立」排在后面（它不说明玩法），最多两个。
 */
function offerNames(o: any, game: any): { titleZh?: string; titleOrig?: string; genres: string[] } {
  const found = (OFFER_NAMES as Record<string, { zh?: string; genres?: string[] }>)[o.id];
  const gameZh = game && CJK.test(game.name?.zh ?? '') ? game.name.zh : undefined;
  const titleZh: string | undefined = o.titleZh ?? gameZh ?? found?.zh;
  const titleOrig = !titleZh ? undefined
    : o.titleZh ? o.gameTitle.replace(o.titleZh, '').trim() || undefined
    : gameZh ? (game.name?.en ?? (CJK.test(o.gameTitle) ? undefined : o.gameTitle))
    : o.gameTitle;
  const raw: string[] = game?.genres?.length ? game.genres : found?.genres ?? [];
  const genres = [...raw.filter((g) => g !== 'indie'), ...raw.filter((g) => g === 'indie')].slice(0, 2);
  return { titleZh, titleOrig, genres };
}

export function offerVM(o: any, data: any, now: number): OfferVM {
  const game = o.gameId ? data.games.find((g: any) => g.id === o.gameId) : null;
  // 美术来源优先级：关联游戏的 Steam 美术 → 情报自带的 steamAppId → 商店链接里的 appid → 手填的官方宣传图 → 自动找到的封面
  const found = (OFFER_ART as Record<string, { steamAppId?: string; wide?: string }>)[o.id];
  // Epic 的活动图是 2560 宽、几 MB 的 PNG：它的图床支持按需缩放，卡片只要 960 宽（大图位用 1920）
  // 站内自托管的图（/art/...）要加上部署子路径
  const sized = (u: string, w: number) => (u.startsWith('/') ? withBase(u) : /^https:\/\/cdn\d*\.epicgames\.com\//.test(u) && !u.includes('?') ? `${u}?resize=1&w=${w}&quality=medium` : u);
  const wideArt = (wide: string, tall?: string) => ({ appid: '', header: sized(wide, 960), poster: sized(tall ?? wide, 600), hero: sized(wide, 1920), logo: '', capsule: sized(wide, 960) });
  const art = (game ? steamArt(game) : null)
    ?? steamArtById(o.steamAppId ?? steamAppIdFromUrl(o.url))
    ?? (o.art ? wideArt(o.art.wide, o.art.tall) : null)
    // 最后一档：同步脚本自动找到的封面（Steam 同名游戏 / 官网分享图，见 scripts/sync/offer-art.mjs）
    ?? (found?.steamAppId ? steamArtById(found.steamAppId) : found?.wide ? wideArt(found.wide) : null);
  return {
    id: o.id, title: o.gameTitle, type: o.type, platform: o.platform, url: o.url, claimNote: o.claimNote, note: o.note,
    startDate: o.startDate, endDate: o.endDate, startMs: offerMs(o.startDate, false), endMs: offerMs(o.endDate, true),
    checkedAt: o.checkedAt, linkHealth: o.linkHealth,
    lifecycle: computeLifecycle(o, now, site.review.staleDays.offerTimed),
    gameSlug: game?.slug, gameName: game?.name?.zh, art,
    claimNoteEn: o.claimNoteEn, ...offerNames(o, game),
  };
}

/** 免费雷达紧迫度排序：进行中且有截止（越近越前）→ 预告 → 长期 → 无生命周期 → 已结束 */
export function byUrgency(a: OfferVM, b: OfferVM) {
  const rank = (o: OfferVM) =>
    o.lifecycle === 'active' ? 0 : o.lifecycle === 'upcoming' ? 1 : o.lifecycle === 'deadline_unknown' ? 2 : o.lifecycle === 'uncertain' ? 3 : o.lifecycle === 'ended' ? 9 : 4;
  return rank(a) - rank(b) || (a.endMs ?? Infinity) - (b.endMs ?? Infinity) || a.title.localeCompare(b.title, 'zh-CN');
}

/** 资源丰富度排序：总资源数 → 渠道数 → 名称 */
export function byRichness(a: GameVM, b: GameVM) {
  return b.counts.total - a.counts.total || b.counts.channels - a.counts.channels || a.name.localeCompare(b.name, 'zh-CN');
}

/** 构建日期（Asia/Shanghai），mono 元数据用 */
export function buildStamp(d = new Date()) {
  const s = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  return s.replace(/-/g, '.');
}

export const SITE = site;
export const SITE_BASE = site.url.replace(/\/$/, '');
