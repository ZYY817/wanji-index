// 展示层视图模型（仅服务端调用）：把 loadData()/buildRelations() 的结果整理成可序列化的 props，
// 供客户端组件使用。只做「整形与计数」，不做资格过滤（资格唯一判定在 eligibility.mjs）。
import { steamArt, steamArtById, steamAppIdFromUrl } from './data.mjs';
import { computeLifecycle } from './lifecycle.mjs';
import { domainOf } from './utils';
import site from '../../config/site.json';

export type Art = { appid: string; header: string; poster: string; hero: string; logo: string; capsule: string } | null;

export type GameVM = {
  id: string; slug: string; name: string; en?: string; aliases: string[]; summary: string;
  publisher?: string;
  genres: string[]; os: string[]; platforms: string[]; art: Art;
  counts: { channels: number; entries: number; tools: number; guides: number; faqs: number; paths: number; total: number };
  updatedAt: string; checkedAt: string; hasOffer: boolean;
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
};

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

export function offerVM(o: any, data: any, now: number): OfferVM {
  const game = o.gameId ? data.games.find((g: any) => g.id === o.gameId) : null;
  const art = game ? steamArt(game) : steamArtById(steamAppIdFromUrl(o.url));
  return {
    id: o.id, title: o.gameTitle, type: o.type, platform: o.platform, url: o.url, claimNote: o.claimNote, note: o.note,
    startDate: o.startDate, endDate: o.endDate, startMs: offerMs(o.startDate, false), endMs: offerMs(o.endDate, true),
    checkedAt: o.checkedAt, linkHealth: o.linkHealth,
    lifecycle: computeLifecycle(o, now, site.review.staleDays.offerTimed),
    gameSlug: game?.slug, gameName: game?.name?.zh, art,
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
