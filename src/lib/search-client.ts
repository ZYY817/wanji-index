'use client';
// 客户端搜索索引加载（命令面板与 /search/ 共用）：withBase fetch + 内存缓存；失败可重试
import { withBase } from './base';
import type { SearchItem } from './search-match';

let cache: Promise<SearchItem[]> | null = null;

export function loadSearchIndex(force = false): Promise<SearchItem[]> {
  if (!cache || force) {
    cache = fetch(withBase('/search-index.json'), { cache: force ? 'reload' : 'default' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => (Array.isArray(j?.items) ? (j.items as SearchItem[]) : Promise.reject(new Error('索引格式错误'))))
      .catch((e) => {
        cache = null;
        throw e;
      });
  }
  return cache;
}

// 最近访问（localStorage）
export type RecentItem = Pick<SearchItem, 'type' | 'title' | 'sub' | 'url' | 'art' | 'seed'>;
const KEY = 'wanji:recent';

export function getRecent(): RecentItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function pushRecent(it: RecentItem) {
  try {
    const next = [it, ...getRecent().filter((x) => x.url !== it.url)].slice(0, 6);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 隐私模式等不可写时忽略 */
  }
}
