// 静态搜索索引端点 —— 生成 /search-index.json（与页面同一资格集合）
import { loadData, buildRelations } from '../lib/load.mjs';
import { buildSearchIndex } from '../lib/search-index.mjs';

export function GET() {
  const data = loadData();
  const index = buildSearchIndex(data, buildRelations(data));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
