// /search-index.json —— 与页面同一资格集合的静态搜索索引
import { loadData, buildRelations } from '@/lib/data.mjs';
import { buildSearchIndex } from '@/lib/search-index.mjs';

export const dynamic = 'force-static';

export function GET() {
  const data = loadData();
  return Response.json(buildSearchIndex(data, buildRelations(data)));
}
