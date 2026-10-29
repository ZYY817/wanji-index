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
export type EntryItem = { id: string; name: string; nameEn?: string; typeLabel: string; typeLabelEn: string; url: string; note?: string; noteEn?: string; health?: string; checkedAt: string; site?: { id: string; name: string; slug: string } };
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
  channels: ['正规获取渠道', '能够购买或免费领取的正规平台。点击直达对应商店页面，具体价格以商店实时为准。', 'Where to get it', 'Official platforms where you can buy or claim this game. Store prices apply.'],
  paths: ['存档与配置路径', '重装系统、迁移新电脑或者给游戏打 MOD 之前，强烈建议先顺手把这几个文件夹备份一份。', 'Saves & config paths', 'Back these folders up before reinstalling Windows, switching PCs, or installing mods.'],
  entries: ['MOD 与汉化专区', '整理了各大知名社区的专属版块与下载入口，找模组和汉化看这里就够了。', 'Mods & translations', 'Curated mod hubs and community resources for this game — we never rehost files.'],
  tools: ['必备配套工具', '模组管理器、前置加载器与实用配套工具，点进去可以直接查看官网与配置要点。', 'Essential tools', 'Mod managers, loaders, and companion utilities with official sites and setup notes.'],
  issues: ['已知问题与排障', '汇总了社区玩家实测遇到的常见 Bug 与解法，遇到奇怪报错先来这里对照一下。', 'Known issues & fixes', 'Common bugs and community fixes reported by players, grouped by symptom.'],
  guides: ['手把手分步教程', '包含安装、报错排查与模组配置的详细指引，每一步都写清了预期的正确反馈。', 'Step-by-step guides', 'Step-by-step walkthroughs for installation, troubleshooting, and modding.'],
  specs: ['硬件配置要求', '来自官方公布的 PC 配置标准；实际运行帧率和流畅度还取决于你的画质设置与驱动版本。', 'System requirements', 'Official PC requirements; actual performance depends on in-game settings and drivers.'],
  faq: ['常见疑问速答', '汇总玩家平时问得最多的几个关键问题，省去到处搜帖翻讨论区的时间。', 'Quick answers', 'The questions players ask most, answered directly without the fluff.'],
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
      id: e.id, name: withoutGame(e.name), nameEn: e.nameEn ? withoutGame(e.nameEn) : undefined, typeLabel: zh('entryType', e.type), typeLabelEn: en('entryType', e.type), url: e.url, note: e.note, noteEn: e.noteEn,
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
