'use client';
import { useL } from '@/components/layout/lang-toggle';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopyButton({ text, className, label: zhLabel = '复制', labelEn = 'Copy' }: { text: string; className?: string; label?: string; labelEn?: string }) {
  const l = useL();
  const label = l(zhLabel, labelEn);
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const done = state === 'done';
  const caption = done ? l('已复制', 'Copied') : state === 'failed' ? l('复制失败，请手动选择', 'Copy failed — select it manually') : label;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);
  return (
    <button
      type="button"
      onClick={async () => {
        let copied = false;
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch {
          const ta = document.createElement('textarea');
          const previousFocus = document.activeElement;
          ta.style.cssText = 'position:fixed;left:-9999px;top:0';
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { copied = document.execCommand('copy'); } catch { copied = false; }
          finally { ta.remove(); if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true }); }
        }
        if (!mounted.current) return;
        setState(copied ? 'done' : 'failed');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setState('idle'), copied ? 1600 : 4000);
      }}
      className={cn(
        'touch-target inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.08] px-3 text-xs font-medium text-fg-2 transition-colors hover:bg-white/[0.14] hover:text-foreground',
        done && 'bg-ok/15 text-ok hover:bg-ok/15 hover:text-ok',
        className,
      )}
      aria-label={state === 'idle' ? `${label}：${text}` : caption}
    >
      {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span aria-live="polite">{caption}</span>
    </button>
  );
}
