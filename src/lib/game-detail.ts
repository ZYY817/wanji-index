// 游戏档案页视图模型：把 data / relations 里与一款游戏相关的内容整理成页面直接可读的结构。
// 页面组件只负责排版，不再自己拼数据；新增章节时先在这里加字段，再加对应的 Section。
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM, offerVM, type GameVM, type OfferVM } from '@/lib/present';
import { genreZh } from '@/lib/genre';
import { zh, en } from '@/lib/labels.mjs';
import { parseReqs, type Reqs } from '@/lib/hardware';
import { issuesByProblem } from '@/lib/problems';

export type ChannelItem = { platform: string; type: string; typeLabel: string; typeLabelEn: string; url: string; note: string; noteEn?: string; health?: string; checkedAt: string };
export type PathItem = { kind: '存档' | '配置'; os: string; path: string; note?: string };
export type EntryItem = { id: string; name: string; typeLabel: string; typeLabelEn: string; url: string; note?: string; health?: string; checkedAt: string; site?: { id: string; name: string; slug: string } };
export type ToolItem = { id: string; slug: string; name: string; summary: string; typeLabel: string; typeLabelEn: string };
export type GuideItem = { id: string; slug: string; title: string; kindLabel: string; kindLabelEn: string; steps: number };
export type FaqItem = { question: string; answer?: string; guide?: { slug: string; title: string } };

export type SectionId = 'channels' | 'paths' | 'entries' | 'tools' | 'guides' | 'issues' | 'specs' | 'faq';
export type IssueGroup = { problem?: { slug: string; short: string; shortEn?: string }; issues: { title: string; url: string; fixed?: boolean }[] };
export type SpecRow = [string, string, string]; // 项目 / 最低 / 推荐
export type SectionMeta = { id: SectionId; title: string; lead: string; titleEn: string; leadEn: string; count: number };

export type GameDetail = {
  vm: GameVM;
  enName?: string;
  summary: string;
  summaryEn?: string;
  genres: string[];
  genreKeys: string[];
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
  /** 首屏下方的一行事实：开发商 · 发售日期 · 中文支持 */
  byline: string[];
  bylineEn: string[];
  specs: SpecRow[];
  /** 英文配置表（Steam 英文商店页原文）；没有时英文界面沿用中文表 */
  specsEn: SpecRow[];
  /** PCGamingWiki 记录的已知问题，按站内问题类型分组 */
  issues: IssueGroup[];
  /** 配置要求里识别出的显卡 / 内存门槛（「我的电脑能玩吗」用） */
  reqs?: Reqs;
  /** 自动收录的来源（人工档案为空） */
  autoSources: { name: string; url: string }[];
  syncedAt?: string;
};

const LEADS: Record<SectionId, [string, string, string, string]> = {
  channels: ['获取渠道', '能买到、能领到这款游戏的平台。按钮直达商店页面，价格以商店为准。', 'Where to get it', 'Stores where you can buy or claim this game. Prices are set by the store.'],
  paths: ['存档与配置', '重装系统、换电脑或装 MOD 之前，先把这些文件夹备份一份。', 'Saves & config', 'Back these folders up before reinstalling Windows, moving PCs or installing mods.'],
  entries: ['MOD 与汉化', '只链接到公认社区的游戏专区，本站不转载任何文件。', 'Mods & translations', 'Links to the game’s pages on trusted communities — we never rehost files.'],
  tools: ['工具', '加载器、管理器与辅助工具，点进去看官网与使用要点。', 'Tools', 'Loaders, managers and helpers — open one for the official site and setup notes.'],
  issues: ['已知问题', '玩家在 PCGamingWiki 上记录过的问题与解法（英文原文），按类型归到本站的排障页。', 'Known issues', 'Issues and fixes recorded on PCGamingWiki, grouped by type and linked to our fix pages.'],
  guides: ['教程', '安装、排障与 MOD 配置的分步教程，每一步写明预期结果。', 'Guides', 'Step-by-step install, troubleshooting and mod guides with the expected result of each step.'],
  specs: ['配置要求', 'Steam 商店公布的 PC 配置要求，实际表现以游戏版本与设置为准。', 'System requirements', 'PC requirements as listed on Steam; real performance depends on version and settings.'],
  faq: ['常见问题', '玩家最常问的问题，能用一句话说清的直接写在这里。', 'FAQ', 'The questions players ask most, answered in a line where possible.'],
};

/** 价格说明的英文：同步脚本写的「参考价 ¥ 25.00」「免费开玩」有固定格式，其余人工文字不硬译 */
function priceNoteEn(note?: string): string | undefined {
  if (!note) return 'See the store for the price';
  const m = /^参考价\s*(.+)$/.exec(note);
  if (m) return `Price ${m[1]}`;
  if (note === '免费开玩') return 'Free to play';
  if (note === '买断制') return 'One-time purchase';
  return /[一-鿿]/.test(note) ? undefined : note;
}

/** 「2022 年 2 月 25 日」→「Feb 25, 2022」 */
function zhDateToEn(d: string): string {
  const m = /(\d{4})\s*年\s*(\d{1,2})\s*月(?:\s*(\d{1,2})\s*日)?/.exec(d);
  if (!m) return d;
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m[2]) - 1];
  return m[3] ? `${mon} ${Number(m[3])}, ${m[1]}` : `${mon} ${m[1]}`;
}

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

  // 在这款游戏自己的档案页里，条目标题不再重复游戏名：「星露谷物语 MOD 专区」→「MOD 专区」
  const gameNames = [g.name?.zh, g.name?.en, ...(g.aliases ?? [])].filter(Boolean).sort((a: string, b: string) => b.length - a.length);
  const withoutGame = (t: string) => {
    for (const n of gameNames) if (t.startsWith(n)) { const rest = t.slice(n.length).replace(/^[\s：:·—-]+/, ''); if (rest) return rest; }
    return t;
  };

  const channels: ChannelItem[] = g.channels.map((c: any) => ({
    platform: c.platform,
    type: c.type,
    typeLabel: zh('channelType', c.type),
    typeLabelEn: en('channelType', c.type),
    url: c.url,
    note: c.priceNote ?? '价格以商店为准',
    noteEn: priceNoteEn(c.priceNote),
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
      id: e.id, name: withoutGame(e.name), typeLabel: zh('entryType', e.type), typeLabelEn: en('entryType', e.type), url: e.url, note: e.note,
      health: e.linkHealth, checkedAt: e.checkedAt, site: site ? { id: site.id, name: site.name, slug: site.slug } : undefined,
    };
  });

  const tools: ToolItem[] = (rel.toolsByGame.get(g.id) ?? []).map((t: any) => ({
    id: t.id, slug: t.slug, name: t.name, summary: t.summary, typeLabel: zh('toolType', t.type), typeLabelEn: en('toolType', t.type),
  }));

  const guides: GuideItem[] = (rel.guidesByGame.get(g.id) ?? []).map((x: any) => ({
    id: x.id, slug: x.slug, title: withoutGame(x.title), kindLabel: zh('guideKind', x.kind), kindLabelEn: en('guideKind', x.kind), steps: x.steps?.length ?? 0,
  }));

  const faqs: FaqItem[] = (g.faqs ?? []).map((f: any) => {
    const guide = data.guides.find((x: any) => x.id === f.guideId);
    return { question: f.question, answer: f.answer, guide: guide ? { slug: guide.slug, title: guide.title } : undefined };
  });

  const offers = (rel.offersByGame.get(g.id) ?? []).map((o: any) => offerVM(o, data, now));
  // 相关游戏：人工指定优先；没有指定时按类型重合度自动挑 6 款（游戏库变大后每页都有「继续探索」）
  const picked = (g.relatedGameIds ?? []).map((id: string) => data.games.find((x: any) => x.id === id)).filter(Boolean);
  const auto = picked.length ? [] : data.games
    .filter((x: any) => x.id !== g.id)
    .map((x: any) => ({ x, score: (x.genres ?? []).filter((t: string) => (g.genres ?? []).includes(t)).length }))
    .filter((r: any) => r.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 6).map((r: any) => r.x);
  const related = [...picked, ...auto].map((x: any) => gameVM(x, rel));

  // 配置要求：Steam 文本「项目: 值」按行对齐成 最低 / 推荐 两列
  const specLines = (t?: string) => new Map((t ?? '').split('\n').map((l: string) => l.split(/[:：]\s*/)).filter((p: string[]) => p.length > 1 && p[1]).map((p: string[]) => [p[0].trim(), p.slice(1).join('：').trim()] as [string, string]));
  const specRows = (r?: { minimum?: string; recommended?: string }): SpecRow[] => {
    const lo = specLines(r?.minimum), hi = specLines(r?.recommended);
    return [...new Set([...lo.keys(), ...hi.keys()])]
      .filter((k) => !/^(最低|推荐)配置$|^(minimum|recommended)$/i.test(k))
      .map((k) => [k.replace(/\s*\*$/, ''), lo.get(k) ?? '—', hi.get(k) ?? '—']);
  };
  const specs = specRows(g.requirements);
  const specsEn = specRows(g.requirementsEn);

  const ZH: Record<string, string> = { 'full-audio': '简体中文（含配音）', text: '简体中文', traditional: '仅繁体中文', none: '暂无官方中文' };
  const byline = [
    g.developers?.length ? `开发商 ${g.developers.join('、')}` : '',
    g.releaseDate ? `发售 ${g.releaseDate}` : '',
    g.zhSupport ? ZH[g.zhSupport] ?? '' : '',
  ].filter(Boolean);
  const EN_ZH: Record<string, string> = { 'full-audio': 'Simplified Chinese (with voice)', text: 'Simplified Chinese', traditional: 'Traditional Chinese only', none: 'No official Chinese' };
  const bylineEn = [
    g.developers?.length ? `Developer ${g.developers.join(', ')}` : '',
    g.releaseDate && !/[一-鿿]/.test(g.releaseDate) ? `Released ${g.releaseDate}` : g.releaseDate ? `Released ${zhDateToEn(g.releaseDate)}` : '',
    g.zhSupport ? EN_ZH[g.zhSupport] ?? '' : '',
  ].filter(Boolean);
  const autoSources = g._auto ? (g.sources ?? []).filter((s: any) => /steampowered|pcgamingwiki/.test(s.url)) : [];

  const issues = issuesByProblem(g);

  const counts: Record<SectionId, number> = {
    channels: channels.length, paths: paths.length, entries: entries.length,
    tools: tools.length, guides: guides.length, issues: issues.reduce((n, x) => n + x.issues.length, 0), specs: specs.length, faq: faqs.length,
  };
  const sections = (Object.keys(LEADS) as SectionId[])
    .filter((id) => counts[id] > 0)
    .map((id) => ({ id, title: LEADS[id][0], lead: LEADS[id][1], titleEn: LEADS[id][2], leadEn: LEADS[id][3], count: counts[id] }));

  return {
    vm: gameVM(g, rel),
    enName: g.name.en,
    summary: g.summary,
    summaryEn: g.summaryEn,
    genres: (g.genres ?? []).map(genreZh),
    genreKeys: g.genres ?? [],
    os: (g.os ?? []).map((o: string) => zh('os', o)),
    reviewStatus: g.reviewStatus,
    checkedAt: g.checkedAt,
    channels, paths, entries, tools, guides, faqs, offers, related, sections,
    byline, bylineEn, specs, specsEn, issues, reqs: parseReqs(g.requirements), autoSources, syncedAt: g._auto?.syncedAt?.slice(0, 10),
  };
}
