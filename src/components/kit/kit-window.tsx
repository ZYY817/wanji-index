'use client';
import { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, Check, FileText, Minus, Package, ScanLine, Settings, Square, Wrench, X } from 'lucide-react';
import { KIT_ITEMS, type KitStatus } from '@/lib/kit';
import { cn } from '@/lib/utils';
import { CropMarks } from '@/components/ui/crop-marks';

const ST: Record<KitStatus, { label: string; cls: string; Icon: any }> = {
  ok: { label: '已安装', cls: 'text-ok', Icon: Check },
  missing: { label: '缺失', cls: 'text-bad-text', Icon: X },
  outdated: { label: '版本过旧', cls: 'text-warn', Icon: AlertTriangle },
};

/**
 * 一键装机工具窗口（CSS 搭建的界面示意）。
 * scanned：已出结果的条目数（SSR 默认全部，保证内容可见）；interactive：/kit/ 页可点「开始检测」播放演示
 */
export function KitWindow({ scanned: scannedProp, interactive, className }: { scanned?: number; interactive?: boolean; className?: string }) {
  const total = KIT_ITEMS.length;
  const [demo, setDemo] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanned = demo ?? scannedProp ?? total;
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const run = () => {
    if (timer.current) clearInterval(timer.current);
    setDemo(0);
    timer.current = setInterval(() => {
      setDemo((v) => {
        const n = (v ?? 0) + 1;
        if (n >= total && timer.current) clearInterval(timer.current);
        return Math.min(n, total);
      });
    }, 320);
  };

  const done = KIT_ITEMS.slice(0, scanned);
  const missing = done.filter((i) => i.status === 'missing').length;
  const outdated = done.filter((i) => i.status === 'outdated').length;
  const scanning = scanned < total;

  return (
    <div className={cn('relative', className)}>
      {/* 裁切线放在圆角外壳之外，避免被 overflow-hidden 裁掉 */}
      <CropMarks size={20} strokeWidth={1.5} inset={-21} className="text-fg-3/70 max-md:hidden" />
      <div className="overflow-hidden rounded-lg border border-border-strong bg-[#0E0E0D] text-left shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)]" role="group" aria-label="一键装机工具界面示意：运行库检测清单">
      {/* 标题栏：窄屏收起窗口按钮，避免标题与预览标签被挤成竖排 */}
      <div className="flex h-10 items-center gap-3 border-b border-border bg-[#141413] pl-3.5 pr-3.5 text-xs text-fg-2 sm:pr-0">
        <span className="grid size-[18px] shrink-0 place-items-center rounded-[3px] bg-foreground font-serif text-2xs font-black text-background">玩</span>
        <span className="min-w-0 truncate text-foreground">玩机索引 · 一键装机工具</span>
        <span className="meta shrink-0 whitespace-nowrap rounded-xs border border-border-strong px-1.5 text-2xs text-fg-3">预览</span>
        <span className="flex-1" />
        <span aria-hidden className="hidden h-full text-fg-3 sm:flex">
          <span className="grid w-11 place-items-center"><Minus className="size-3.5" /></span>
          <span className="grid w-11 place-items-center"><Square className="size-3" /></span>
          <span className="grid w-11 place-items-center"><X className="size-3.5" /></span>
        </span>
      </div>

      <div className="grid grid-cols-[1fr] sm:grid-cols-[168px_1fr]">
        {/* 侧栏 */}
        <div aria-hidden className="hidden flex-col border-r border-border bg-[#111110] p-2 text-xs sm:flex">
          {[['检测', ScanLine], ['运行库', Package], ['修复', Wrench], ['日志', FileText], ['性能', Activity], ['设置', Settings]].map(([l, I]: any, i) => (
            <span key={l} className={cn('flex h-9 items-center gap-2.5 rounded-xs px-2.5', i === 0 ? 'bg-surface-3 text-foreground' : 'text-fg-3')}>
              <I className="size-3.5" />
              {l}
            </span>
          ))}
          <span className="flex-1" />
          <span className="meta px-2.5 pb-1 text-2xs text-fg-3">v0.1 · 开发中</span>
        </div>

        {/* 主区 */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-foreground">运行库检测</p>
              <p className="mt-0.5 font-mono text-2xs tabular-nums text-fg-3">
                {scanning ? `正在检测 ${String(scanned).padStart(2, '0')} / ${total}…` : `已检测 ${total} 项 · `}
                {!scanning && <><span className="text-bad-text">{missing} 项缺失</span> · <span className="text-warn">{outdated} 项过旧</span></>}
              </p>
            </div>
            {interactive ? (
              <button type="button" onClick={run} disabled={scanning && demo != null} className="inline-flex h-9 items-center gap-2 rounded-sm border border-border-strong px-3 text-xs text-foreground hover:border-foreground/60 disabled:opacity-50">
                <ScanLine className="size-3.5" aria-hidden /> {demo == null ? '播放检测演示' : '重新检测'}
              </button>
            ) : (
              <span aria-hidden className="inline-flex h-9 items-center gap-2 rounded-sm border border-border-strong px-3 text-xs text-fg-2"><ScanLine className="size-3.5" />重新检测</span>
            )}
          </div>
          <div className="h-[2px] bg-border">
            <div className="h-full bg-foreground transition-[width] duration-300" style={{ width: `${(scanned / total) * 100}%` }} />
          </div>

          <div className="relative">
            <ul className="divide-y divide-border">
            {KIT_ITEMS.map((it, i) => {
              const shown = i < scanned;
              const st = ST[it.status];
              const current = i === scanned && scanning;
              return (
                <li key={i} className={cn('grid grid-cols-[52px_1fr_auto] items-center gap-3 px-5 py-2.5 text-sm sm:grid-cols-[64px_1fr_44px_96px]', current && 'bg-surface-2')}>
                  <span className="font-mono text-2xs text-fg-3">{it.group}</span>
                  <span className={cn('truncate', shown ? 'text-foreground' : 'text-fg-3')}>{it.name}</span>
                  <span className="hidden font-mono text-2xs text-fg-3 sm:block">{it.arch ?? '—'}</span>
                  <span className={cn('flex items-center justify-end gap-1.5 font-mono text-2xs', shown ? st.cls : current ? 'text-primary' : 'text-fg-3')}>
                    {shown ? (
                      <><st.Icon className="size-3.5" aria-hidden />{st.label}</>
                    ) : current ? (
                      <span className="inline-flex items-center gap-0.5">
                        <span aria-hidden className="animate-blink">▌</span>
                        <span className="animate-blink">检测中</span>
                      </span>
                    ) : (
                      '等待'
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
            {scanning && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-primary/70 shadow-[0_0_18px_2px_rgba(216,182,122,0.4)] transition-[top] duration-500 ease-out"
                style={{ top: `${(scanned / total) * 100}%` }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-[#111110] px-5 py-3">
            <span className="meta text-2xs text-fg-3">界面示意 · 演示数据</span>
            <span className="flex-1" />
            <span aria-hidden className={cn('inline-flex h-9 items-center rounded-sm px-4 text-xs font-medium', !scanning && missing + outdated > 0 ? 'bg-foreground text-background' : 'bg-surface-3 text-fg-3')}>
              一键修复 {!scanning ? missing + outdated : '—'} 项
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
