'use client';
import type { DossierVM } from '@/lib/home-data';
import { PlatformMark } from '@/components/ui/platform-mark';
import { CropMarks } from '@/components/ui/crop-marks';
import { genreZh } from '@/lib/genre';
import { zh } from '@/lib/labels.mjs';
import { cn } from '@/lib/utils';

// 第 3 章 · 档案五步：顺序即装配顺序（渠道 → MOD/汉化 → 工具 → 排障 → 存档路径）
export const DOSSIER_STEPS = [
  { no: '01', title: '渠道', desc: '官方商店与正版平台，标明买断、免费或订阅。' },
  { no: '02', title: 'MOD · 汉化', desc: '只链到公认社区的游戏专区，不转载任何文件。' },
  { no: '03', title: '工具', desc: '加载器、管理器、监控工具，附官网与风险提示。' },
  { no: '04', title: '排障', desc: '报错原文可搜，步骤写明预期结果与失败分支。' },
  { no: '05', title: '存档路径', desc: '存档与配置路径一键复制，重装前先备份。' },
] as const;

export function stepCount(d: DossierVM, i: number) {
  return [d.channels.length, d.mods.length, d.tools.length, d.guides.length, d.paths.length][i] ?? 0;
}

export function stepTotal(d: DossierVM) {
  return DOSSIER_STEPS.reduce((n, _, i) => n + stepCount(d, i), 0);
}

function Empty() {
  return <p className="font-mono text-2xs tracking-[0.08em] text-fg-3">暂无收录</p>;
}

// 档案行内容：同一份真实数据同时供桌面档案板与移动端长列表使用
export function StepContent({ d, index, mode = 'board' }: { d: DossierVM; index: number; mode?: 'board' | 'stack' }) {
  const body = mode === 'board' ? 'text-xs leading-[1.45]' : 'text-sm leading-[1.55]';
  switch (index) {
    case 0:
      return (
        <ul className={mode === 'board' ? 'space-y-1' : 'space-y-2.5'}>
          {d.channels.map((c, i) => (
            <li key={i} className={cn('flex flex-wrap items-center gap-x-2 gap-y-1', body)}>
              <PlatformMark platform={c.platform} withLabel className="text-foreground" />
              <span className="text-fg-2">{c.type}</span>
              {c.priceNote && (
                <span className={cn('ml-auto font-mono text-2xs tracking-[0.08em] text-fg-3', mode === 'stack' && 'ml-0')}>
                  {c.priceNote}
                </span>
              )}
            </li>
          ))}
        </ul>
      );
    case 1:
      return d.mods.length ? (
        <ul className={mode === 'board' ? 'space-y-1' : 'space-y-2'}>
          {d.mods.map((m, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className={cn('text-foreground', body)}>{m.name}</span>
              <span className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-3">{m.site}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty />
      );
    case 2:
      return d.tools.length ? (
        <ul className={mode === 'board' ? 'space-y-1.5' : 'space-y-3'}>
          {d.tools.map((t, i) => (
            <li key={i}>
              <div className="flex items-baseline justify-between gap-3">
                <span className={cn('text-foreground', body)}>{t.name}</span>
                <span className="shrink-0 font-mono text-2xs tracking-[0.1em] text-fg-3">{t.type}</span>
              </div>
              <p className={cn('mt-0.5 text-2xs leading-[1.5] text-fg-2', mode === 'board' && 'line-clamp-1')}>{t.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty />
      );
    case 3:
      return d.guides.length ? (
        <ul className={mode === 'board' ? 'space-y-1' : 'space-y-2'}>
          {d.guides.map((x, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className={cn('text-foreground', body)}>{x.title}</span>
              <span className="shrink-0 font-mono text-2xs tracking-[0.08em] text-fg-3">
                {x.kind} · {x.steps} 步
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty />
      );
    case 4:
      return (
        <div
          className={cn(
            'font-mono',
            mode === 'board'
              ? 'space-y-1 border border-border bg-shell px-2.5 py-1.5 text-2xs leading-[1.5]'
              : 'space-y-2.5 border-y border-border bg-shell px-3 py-3 text-2xs leading-[1.6]',
          )}
        >
          {d.paths.map((p, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="w-7 shrink-0 text-fg-3">{p.label}</span>
              <span className="min-w-0 break-all text-foreground">{p.path}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// 16:9 官方美术板：透明 logo + 类型 / 平台（桌面档案顶栏 / 移动端全出血首图共用）
// eager：桌面 sticky 舞台里的图片不走懒加载（吸顶容器内浏览器可能永远不触发加载）
export function DossierPlate({ d, className, eager }: { d: DossierVM; className?: string; eager?: boolean }) {
  const g = d.game;
  return (
    <div className={cn('relative aspect-video w-full overflow-hidden border-b border-border-strong bg-shell', className)}>
      {g.art && (
        <img
          src={g.art.hero}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 size-full object-cover object-[50%_42%]"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,11,10,0.7)_0%,rgba(12,11,10,0.04)_36%,rgba(12,11,10,0.12)_62%,rgba(12,11,10,0.9)_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,11,10,0.52)_0%,transparent_58%)]" />
      <div className="relative flex h-full flex-col justify-end p-3.5 md:p-4">
        <div className="flex items-end justify-between gap-4">
          {g.art ? (
            <img
              src={g.art.logo}
              alt=""
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-[44%] max-w-[250px] object-contain object-left"
            />
          ) : (
            <span className="font-serif text-2xl font-black leading-none">{g.name}</span>
          )}
          <div className="space-y-0.5 text-right text-xs leading-[1.5] text-foreground/80">
            <p>{g.genres.map(genreZh).join(' · ')}</p>
            <p>{g.os.map((o) => zh('os', o)).join(' / ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 桌面档案板：五行真实内容常驻；当前行抬升 + 左侧橙色刻度，其余行压暗，视线只落在一处
export function DossierBoard({ d, active, className, eager }: { d: DossierVM; active: number | null; className?: string; eager?: boolean }) {
  const g = d.game;
  return (
    <article className={cn('relative border border-border-strong bg-card', className)} aria-label={`${g.name} 档案示例`}>
      <CropMarks size={16} inset={-9} className="text-fg-3" />
      <header className="flex h-11 items-center gap-3 border-b border-border px-4">
        <span className="truncate font-serif text-base font-bold text-foreground">{g.name}</span>
        <span className="ml-auto shrink-0 text-xs text-fg-3">核验于 {g.checkedAt}</span>
      </header>
      <DossierPlate d={d} eager={eager} />
      <div>
        {DOSSIER_STEPS.map((s, i) => {
          const isActive = active === i;
          const dim = active !== null && !isActive;
          return (
            <div
              key={s.no}
              data-state={isActive ? 'active' : 'idle'}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'relative grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-border px-4 py-2 transition-[background-color,opacity] duration-500 last:border-b-0',
                isActive ? 'bg-surface-2' : 'bg-transparent',
                dim && 'opacity-45',
              )}
            >
              <span
                aria-hidden
                className={cn('absolute inset-y-0 left-0 w-[2px] bg-primary transition-opacity duration-500', isActive ? 'opacity-100' : 'opacity-0')}
              />
              <div className="min-w-0">
                <p className={cn('font-mono text-2xs leading-none tabular-nums transition-colors duration-300', isActive ? 'text-primary' : 'text-fg-3')}>
                  {s.no}
                </p>
                <p className={cn('mt-1.5 whitespace-nowrap text-xs font-medium leading-none transition-colors duration-300', isActive ? 'text-foreground' : 'text-fg-2')}>
                  {s.title}
                </p>
              </div>
              <div className="min-w-0">
                <StepContent d={d} index={i} mode="board" />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
