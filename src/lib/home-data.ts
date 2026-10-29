// 首页叙事数据（仅服务端）：一次 loadData() 整理出七章所需的可序列化 props
import { loadData, buildRelations } from './data.mjs';
import { zh, en } from './labels.mjs';
import { gameVM, siteVM, offerVM, byRichness, byUrgency, buildStamp, type GameVM, type SiteVM, type OfferVM } from './present';

export type DossierVM = {
  game: GameVM;
  channels: { platform: string; type: string; typeEn: string; priceNote?: string; priceNoteEn?: string }[];
  mods: { name: string; site: string }[];
  tools: { name: string; type: string; summary: string }[];
  guides: { title: string; steps: number; kind: string }[];
  paths: { label: string; labelEn: string; path: string }[];
};

export type HomeData = {
  build: string;
  counts: { games: number; sites: number; tools: number; guides: number; offers: number; entries: number; categories: number };
  heroes: GameVM[];
  /** 首屏「热门」快捷入口 */
  popular: GameVM[];
  wall: GameVM[];
  dossier: DossierVM | null;
  offers: OfferVM[];
  sites: SiteVM[];
  siteGroups: { category: string; label: string; labelEn: string; sites: SiteVM[] }[];
};

/**
 * 章节强调色：取自该游戏官方美术的主色（人工挑选，保证在暗底上 ≥ 4.5:1）。
 * 网站本身没有固定品牌色——镜头里是哪款游戏，强调色就来自哪款游戏。
 */
export const GAME_ACCENT: Record<string, string> = {
  'black-myth-wukong': '#D08A4E',
  'stardew-valley': '#5CC2B2',
  'elden-ring': '#D9B76A',
  'cyberpunk-2077': '#F2E94E',
};
export const accentOf = (id?: string) => (id && GAME_ACCENT[id]) || '#F5F5F7';

const HERO_ORDER = ['black-myth-wukong', 'elden-ring', 'cyberpunk-2077', 'baldurs-gate-3', 'red-dead-redemption-2'];
const POPULAR_ORDER = ['stardew-valley', 'elden-ring', 'cyberpunk-2077'];
const CATEGORY_ORDER = ['store', 'free-platform', 'indie', 'mod', 'localization', 'guide-wiki', 'patch-support', 'other'];

export function homeData(): HomeData {
  const data = loadData();
  const rel = buildRelations(data);
  const now = Date.now();
  const games = data.games.map((g: any) => gameVM(g, rel)).sort(byRichness);
  const pick = (ids: string[]) => ids.map((id) => games.find((g) => g.id === id)).filter((g): g is GameVM => !!g?.art);
  const withArt = games.filter((g) => g.art);
  const heroes = pick(HERO_ORDER).slice(0, 4);
  const popular = pick(POPULAR_ORDER);

  // 档案章：以星露谷物语为样本（数据最全）；不存在时取资源最丰富的游戏
  const sample = data.games.find((g: any) => g.id === 'stardew-valley') ?? data.games[0];
  let dossier: DossierVM | null = null;
  if (sample) {
    const sites = new Map(data.sites.map((s: any) => [s.id, s]));
    const entries = rel.entriesByGame.get(sample.id) ?? [];
    const guides = [...(rel.guidesByGame.get(sample.id) ?? []), ...data.guides.filter((g: any) => !(g.games ?? []).length && g.kind === 'troubleshooting')];
    dossier = {
      game: gameVM(sample, rel),
      channels: sample.channels.map((c: any) => ({ platform: c.platform, type: zh('channelType', c.type), typeEn: en('channelType', c.type), priceNote: c.priceNote, priceNoteEn: c.priceNote === '买断制' ? 'One-time purchase' : c.priceNote === '免费开玩' ? 'Free to play' : undefined })),
      mods: entries.filter((e: any) => e.type === 'mod' || e.type === 'localization').map((e: any) => ({ name: e.name, site: (sites.get(e.siteId) as any)?.name ?? '' })),
      tools: (rel.toolsByGame.get(sample.id) ?? []).map((t: any) => ({ name: t.name, type: zh('toolType', t.type), summary: t.summary })),
      guides: guides.slice(0, 2).map((g: any) => ({ title: g.title, steps: g.steps.length, kind: zh('guideKind', g.kind) })),
      paths: [
        ...(sample.savePaths ?? []).map((p: any) => ({ label: '存档', labelEn: 'Saves', path: p.path })),
        ...(sample.configPaths ?? []).map((p: any) => ({ label: '配置', labelEn: 'Config', path: p.path })),
      ],
    };
  }

  const offers = data.offers.map((o: any) => offerVM(o, data, now)).filter((o: OfferVM) => o.lifecycle !== 'ended').sort(byUrgency);
  const sites = data.sites.map((s: any) => siteVM(s, rel)).sort((a: SiteVM, b: SiteVM) => b.entryCount - a.entryCount || a.name.localeCompare(b.name));
  const siteGroups = CATEGORY_ORDER.map((c) => ({ category: c, label: zh('siteCategory', c), labelEn: en('siteCategory', c), sites: sites.filter((s: SiteVM) => s.category === c) })).filter((g) => g.sites.length);

  return {
    build: buildStamp(),
    counts: {
      games: data.games.length, sites: data.sites.length, tools: data.tools.length, guides: data.guides.length,
      offers: data.offers.length, entries: data.entries.length, categories: siteGroups.length,
    },
    heroes, popular, wall: withArt, dossier, offers, sites, siteGroups,
  };
}
