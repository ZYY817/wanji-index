// 游戏档案页视图模型：把 data / relations 里与一款游戏相关的内容整理成页面直接可读的结构。
// 页面组件只负责排版，不再自己拼数据；新增章节时先在这里加字段，再加对应的 Section。
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM, offerVM, type GameVM, type OfferVM } from '@/lib/present';
import { genreZh } from '@/lib/genre';
import { zh } from '@/lib/labels.mjs';

export type ChannelItem = { platform: string; type: string; typeLabel: string; url: string; note: string; health?: string; checkedAt: string };
export type PathItem = { kind: '存档' | '配置'; os: string; path: string; note?: string };
export type EntryItem = { id: string; name: string; typeLabel: string; url: string; note?: string; health?: string; checkedAt: string; site?: { name: string; slug: string } };
export type ToolItem = { id: string; slug: string; name: string; summary: string; typeLabel: string };
export type GuideItem = { id: string; slug: string; title: string; kindLabel: string; steps: number };
export type FaqItem = { question: string; answer?: string; guide?: { slug: string; title: string } };

export type SectionId = 'channels' | 'paths' | 'entries' | 'tools' | 'guides' | 'faq';
export type SectionMeta = { id: SectionId; title: string; lead: string; count: number };

export type GameDetail = {
  vm: GameVM;
  enName?: string;
  summary: string;
  genres: string[];
  os: string[];
  reviewStatus: string;
  checkedAt: string;
  channels: ChannelItem[];
  paths: PathItem[];
  entries: EntryItem[];
  tools: ToolItem[];
  guides: GuideItem[];
  faqs: FaqItem[];
  offers: OfferVM[];
  related: GameVM[];
  sections: SectionMeta[];
};

const LEADS: Record<SectionId, [string, string]> = {
  channels: ['获取渠道', '官方商店与正版平台。按钮直达商店页面，价格以商店为准。'],
  paths: ['存档与配置', '重装系统、换电脑或装 MOD 之前，先把这些文件夹备份一份。'],
  entries: ['MOD 与汉化', '只链接到公认社区的游戏专区，本站不转载任何文件。'],
  tools: ['工具', '加载器、管理器与辅助工具，点进去看官网与使用要点。'],
  guides: ['教程', '安装、排障与 MOD 配置的分步教程，每一步写明预期结果。'],
  faq: ['常见问题', '玩家最常问的问题，能用一句话说清的直接写在这里。'],
};

export function gameSlugs(): string[] {
  return loadData().games.map((g: any) => g.slug);
}

export function gameMeta(slug: string): { name: string; summary: string } | null {
  const g = loadData().games.find((x: any) => x.slug === slug);
  return g ? { name: g.name.zh, summary: g.summary } : null;
}

export function gameDetail(slug: string): GameDetail | null {
  const data = loadData();
  const g = data.games.find((x: any) => x.slug === slug);
  if (!g) return null;
  const rel = buildRelations(data);
  const now = Date.now();

  const channels: ChannelItem[] = g.channels.map((c: any) => ({
    platform: c.platform,
    type: c.type,
    typeLabel: zh('channelType', c.type),
    url: c.url,
    note: c.priceNote ?? '价格以商店为准',
    health: c.linkHealth,
    checkedAt: c.checkedAt,
  }));

  const paths: PathItem[] = [
    ...(g.savePaths ?? []).map((p: any) => ({ kind: '存档' as const, os: zh('os', p.os ?? 'windows'), path: p.path, note: p.note })),
    ...(g.configPaths ?? []).map((p: any) => ({ kind: '配置' as const, os: zh('os', p.os ?? 'windows'), path: p.path, note: p.note })),
  ];

  const entries: EntryItem[] = (rel.entriesByGame.get(g.id) ?? []).map((e: any) => {
    const site = data.sites.find((s: any) => s.id === e.siteId);
    return {
      id: e.id, name: e.name, typeLabel: zh('entryType', e.type), url: e.url, note: e.note,
      health: e.linkHealth, checkedAt: e.checkedAt, site: site ? { name: site.name, slug: site.slug } : undefined,
    };
  });

  const tools: ToolItem[] = (rel.toolsByGame.get(g.id) ?? []).map((t: any) => ({
    id: t.id, slug: t.slug, name: t.name, summary: t.summary, typeLabel: zh('toolType', t.type),
  }));

  const guides: GuideItem[] = (rel.guidesByGame.get(g.id) ?? []).map((x: any) => ({
    id: x.id, slug: x.slug, title: x.title, kindLabel: zh('guideKind', x.kind), steps: x.steps?.length ?? 0,
  }));

  const faqs: FaqItem[] = (g.faqs ?? []).map((f: any) => {
    const guide = data.guides.find((x: any) => x.id === f.guideId);
    return { question: f.question, answer: f.answer, guide: guide ? { slug: guide.slug, title: guide.title } : undefined };
  });

  const offers = (rel.offersByGame.get(g.id) ?? []).map((o: any) => offerVM(o, data, now));
  const related = (g.relatedGameIds ?? [])
    .map((id: string) => data.games.find((x: any) => x.id === id))
    .filter(Boolean)
    .map((x: any) => gameVM(x, rel));

  const counts: Record<SectionId, number> = {
    channels: channels.length, paths: paths.length, entries: entries.length,
    tools: tools.length, guides: guides.length, faq: faqs.length,
  };
  const sections = (Object.keys(LEADS) as SectionId[])
    .filter((id) => counts[id] > 0)
    .map((id) => ({ id, title: LEADS[id][0], lead: LEADS[id][1], count: counts[id] }));

  return {
    vm: gameVM(g, rel),
    enName: g.name.en,
    summary: g.summary,
    genres: (g.genres ?? []).map(genreZh),
    os: (g.os ?? []).map((o: string) => zh('os', o)),
    reviewStatus: g.reviewStatus,
    checkedAt: g.checkedAt,
    channels, paths, entries, tools, guides, faqs, offers, related, sections,
  };
}
