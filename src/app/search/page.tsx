import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchClient } from '@/components/search-client';

export const metadata: Metadata = { title: '搜索', description: '站内搜索', robots: { index: false } };

export default function SearchPage() {
  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-black tracking-tight">搜索</h1>
      <Suspense fallback={<div className="meta mt-8">加载中…</div>}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
