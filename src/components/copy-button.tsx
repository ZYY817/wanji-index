'use client';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="shrink-0 rounded-md border border-[var(--color-line-ctl)] px-2 py-0.5 text-xs text-[var(--color-amber-hi)] hover:border-[var(--color-amber)]"
      onClick={async () => { await navigator.clipboard.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      {ok ? '已复制' : '复制'}
    </button>
  );
}
