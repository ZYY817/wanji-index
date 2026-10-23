'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search/?q=${encodeURIComponent(q.trim())}`); }} className="relative">
      <input className="inp !h-14 !rounded-xl !px-5 !text-base !border-[var(--color-line-1)]" placeholder="搜游戏名、报错文本、工具名…" value={q} onChange={(e) => setQ(e.target.value)} />
      <button type="submit" className="btn-acq absolute right-2 top-2">搜索</button>
    </form>
  );
}
