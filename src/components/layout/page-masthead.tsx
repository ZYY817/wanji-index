import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GLOW_IMG, GLOW_VEIL } from '@/components/fx/glow';

type Crumb = [string, string?];

function Crumbs({ crumbs }: { crumbs?: Crumb[] }) {
  return (
    <nav aria-label="面包屑" className="flex max-w-full flex-wrap items-center gap-2 text-sm text-fg-3">
      <Link href="/" className="hover:text-foreground">首页</Link>
      {(crumbs ?? [['索引']]).map(([label, href], i, all) => {
        const current = !href;
        return (
          <span key={i} className={cn('items-center gap-2', current && i === all.length - 1 ? 'hidden sm:flex' : 'flex')}>
            <span aria-hidden>/</span>
            {href ? <Link href={href} className="hover:text-foreground">{label}</Link> : <span className="text-fg-2" aria-current={current ? 'page' : undefined}>{label}</span>}
          </span>
        );
      })}
    </nav>
  );
}

/** 页头外框（详情页复用）：面包屑 + 容器。 */
export function PageMastheadFrame({
  no: _no, crumbs, children, className,
}: {
  no?: string; crumbs?: Crumb[]; children: React.ReactNode; className?: string;
}) {
  return (
    <header className={cn('relative border-b border-border pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+64px)]', className)}>
      <div className="container-x">
        <div className="relative">
          <Crumbs crumbs={crumbs} />
          {children}
        </div>
      </div>
    </header>
  );
}

export type MastheadStat = { value: number | string; label: string };

/** 写在句子里的数字：香槟金、等宽——数字是这句话的一部分，而不是旁边的一块统计面板 */
export function MastNum({ children }: { children: React.ReactNode }) {
  return <span className="font-mono font-medium tabular-nums text-primary">{children}</span>;
}

/**
 * 索引页刊头。不是「大标题 + 一段说明 + 两个大数字」的模板，而是这一页的第一眼：
 *   标题与一句话（数字写在句子里）→ 下方一条「内容带」，直接是这一页的东西本身在缓缓流过
 *   （游戏库是海报、免费是此刻免费的游戏、资源站是 19 个站标、教程是真实的报错原文……）。
 *   背后一团取自这一页美术的色光，与首页同一套布光。
 * `band` 内容带；`glow` 色光取色的图片；没有内容带的页面（搜索、关于、装机）仍可用 `stats` / `aside`。
 */
export function IndexMasthead({
  no, title, description, stats, aside, band, glow, crumbs, children, className,
}: {
  no?: string; title: React.ReactNode; description?: React.ReactNode; stats?: MastheadStat[];
  aside?: React.ReactNode; band?: React.ReactNode; glow?: string | null; crumbs?: Crumb[]; children?: React.ReactNode; className?: string;
}) {
  const label = typeof title === 'string' ? title : undefined;
  return (
    <header className={cn('relative overflow-hidden border-b border-border pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+56px)]', className)}>
      {/* 色光：这一页的颜色；没有美术时是一抹极淡的香槟金 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {glow ? (
          <>
            <img src={glow} alt="" className={cn(GLOW_IMG, 'opacity-30')} />
            <div className={GLOW_VEIL} />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_75%_0%,rgba(216,182,122,0.09)_0%,transparent_70%)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container-x relative">
        <Crumbs crumbs={crumbs ?? (label ? [[label]] : undefined)} />
        <div className={cn('grid gap-8 pt-6 md:grid-cols-12 md:items-end md:gap-10', band ? 'pb-0' : 'pb-10 md:pb-12')}>
          <div className={cn(aside || stats?.length ? 'md:col-span-7' : 'md:col-span-9')}>
            <h1 className="font-serif text-[clamp(44px,5.2vw,76px)] font-black leading-[1.02] tracking-[-0.045em] text-foreground">{title}</h1>
            {description && <div className="mt-5 max-w-[34em] text-lg leading-[1.75] text-fg-2 text-pretty">{description}</div>}
          </div>
          {aside ? (
            <div className="md:col-span-5">{aside}</div>
          ) : stats?.length ? (
            <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-4 md:col-span-5 md:justify-end md:border-t-0 md:pt-0">
              {stats.map((s, i) => (
                <div key={s.label} className="flex flex-col-reverse gap-2">
                  <dt className="text-sm text-fg-2">{s.label}</dt>
                  <dd className={cn('font-mono text-4xl leading-none tracking-[-0.03em] tabular-nums md:text-5xl', i === 0 ? 'text-primary' : 'text-foreground')}>{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {children}
      </div>

      {/* 内容带：通栏，两端渐隐，悬停暂停 */}
      {band && (
        <div className="relative mt-10 pb-10 [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] md:mt-12 md:pb-12">
          {band}
        </div>
      )}
    </header>
  );
}
