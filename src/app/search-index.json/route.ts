// /search-index.json —— 与页面同一资格集合的静态搜索索引
// 在 buildSearchIndex() 输出基础上追加展示字段（游戏缩略图 art / 资源站图章 seed），不改变检索逻辑
import { loadData, buildRelations, steamArt } from '@/lib/data.mjs';
import { buildSearchIndex } from '@/lib/search-index.mjs';

export const dynamic = 'force-static';

export function GET() {
  const data = loadData();
  const idx = buildSearchIndex(data, buildRelations(data));
  const games = new Map(data.games.map((g: any) => [`/games/${g.slug}/`, g]));
  const sites = new Map(data.sites.map((s: any) => [`/resources/${s.slug}/`, s]));
  idx.items = idx.items.map((it: any) => {
    if (it.type === 'game') {
      const g = games.get(it.url);
      return { ...it, art: g ? steamArt(g)?.header ?? null : null };
    }
    if (it.type === 'site') {
      const s: any = sites.get(it.url);
      return { ...it, seed: s?.id };
    }
    return it;
  });
  return Response.json(idx);
}
