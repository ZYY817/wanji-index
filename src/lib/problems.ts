// 问题排查视图模型：问题本身 + 站内教程 + 相关问题 + 「哪些游戏记录过这类问题」。
// 游戏的已知问题来自 PCGamingWiki 自动收录（scripts/sync/pcgw-paths.mjs 写入 game.issues），按 issueMatch 关键词归类。
import { loadData, steamArt } from '@/lib/data.mjs';

export type Source = { name: string; url: string };
export type Fix = { title: string; detail: string; when?: string; guide?: { slug: string; title: string }; sources: Source[] };
export type GameIssues = { slug: string; name: string; art?: string; issues: { title: string; url: string; fixed?: boolean }[] };
export type ProblemVM = {
  id: string; slug: string; title: string; short: string; category: string; summary: string;
  titleEn?: string; shortEn?: string; summaryEn?: string;
  symptoms: string[]; errorTexts: string[]; fixes: Fix[]; avoid: string[];
  table?: { caption?: string; columns: string[]; rows: string[][] };
  related: { slug: string; title: string; short: string; titleEn?: string }[];
  sources: Source[]; games: GameIssues[];
  reviewStatus: string; checkedAt: string; updatedAt: string; keywords: string[];
};

// 关键词只在单词开头匹配：「hang」不能命中 changes，「lod」不能命中 explode
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matches = (title: string, keys: string[]) => {
  const t = title.toLowerCase();
  return keys.some((k) => new RegExp(`(^|[^a-z0-9])${esc(k)}`).test(t));
};

function gamesFor(data: any, keys: string[] = []): GameIssues[] {
  if (!keys.length) return [];
  return data.games
    .map((g: any) => ({
      slug: g.slug, name: g.name.zh, art: steamArt(g)?.header,
      issues: (g.issues ?? []).filter((i: any) => matches(i.title, keys)),
    }))
    .filter((g: GameIssues) => g.issues.length)
    .sort((a: GameIssues, b: GameIssues) => b.issues.length - a.issues.length);
}

function vm(data: any, p: any, withGames = true): ProblemVM {
  const guide = (id?: string) => {
    const g = id && data.guides.find((x: any) => x.id === id);
    return g ? { slug: g.slug, title: g.title } : undefined;
  };
  const fixes: Fix[] = p.fixes.map((f: any) => ({ title: f.title, detail: f.detail, when: f.when, guide: guide(f.guideId), sources: f.sources ?? [] }));
  const sources = [...new Map(fixes.flatMap((f) => f.sources).map((s) => [s.url, s])).values()];
  return {
    id: p.id, slug: p.slug, title: p.title, short: p.short ?? p.title, category: p.category, summary: p.summary,
    titleEn: p.titleEn, shortEn: p.shortEn, summaryEn: p.summaryEn,
    symptoms: p.symptoms ?? [], errorTexts: p.errorTexts ?? [], fixes, avoid: p.avoid ?? [], table: p.table,
    related: (p.relatedProblems ?? []).map((id: string) => data.problems.find((x: any) => x.id === id)).filter(Boolean)
      .map((x: any) => ({ slug: x.slug, title: x.title, short: x.short ?? x.title, titleEn: x.titleEn })),
    sources, games: withGames ? gamesFor(data, p.issueMatch) : [],
    reviewStatus: p.reviewStatus, checkedAt: p.checkedAt, updatedAt: p.updatedAt, keywords: p.keywords ?? [],
  };
}

export function problemSlugs(): string[] {
  return loadData().problems.map((p: any) => p.slug);
}

export function problemDetail(slug: string): ProblemVM | null {
  const data = loadData();
  const p = data.problems.find((x: any) => x.slug === slug);
  return p ? vm(data, p) : null;
}

/** 索引页：按分类顺序排列；每个问题附「记录过这类问题的游戏数」 */
export function problemList(): (ProblemVM & { gameCount: number })[] {
  const data = loadData();
  const order = ['crash', 'launch', 'dll', 'display', 'performance', 'save', 'input', 'network'];
  return data.problems
    .map((p: any) => { const v = vm(data, p); return { ...v, gameCount: v.games.length }; })
    .sort((a: ProblemVM, b: ProblemVM) => order.indexOf(a.category) - order.indexOf(b.category));
}

/** 某款游戏的已知问题，按问题类型归到站内的排查页（游戏档案页用） */
export function issuesByProblem(game: any): { problem?: { slug: string; short: string; shortEn?: string }; issues: { title: string; url: string; fixed?: boolean }[] }[] {
  const data = loadData();
  const groups = new Map<string, { problem?: { slug: string; short: string; shortEn?: string }; issues: any[] }>();
  for (const i of game.issues ?? []) {
    const p = data.problems.find((x: any) => matches(i.title, x.issueMatch ?? []));
    const key = p?.id ?? '_other';
    if (!groups.has(key)) groups.set(key, { problem: p ? { slug: p.slug, short: p.short ?? p.title, shortEn: p.shortEn } : undefined, issues: [] });
    groups.get(key)!.issues.push(i);
  }
  return [...groups.values()].sort((a, b) => (a.problem ? 0 : 1) - (b.problem ? 0 : 1));
}
