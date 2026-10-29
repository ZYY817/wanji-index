import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GLOW_IMG, GLOW_VEIL } from '@/components/fx/glow';
import { T } from '@/lib/i18n';

type Crumb = [React.ReactNode, string?];

function Crumbs({ crumbs }: { crumbs?: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex max-w-full flex-wrap items-center gap-2 text-sm text-fg-3">
      <Link href="/" className="transition-colors hover:text-foreground"><T zh="首页" en="Home" /></Link>
      {(crumbs ?? ([[<T key="i" zh="索引" en="Index" />]] as Crumb[])).map(([label, href], i, all) => {
        const current = !href;
        return (
          <span key={i} className={cn('items-center gap-2', current && i === all.length - 1 ? 'hidden sm:flex' : 'flex')}>
            <span aria-hidden>/</span>
            {href ? <Link href={href} className="transition-colors hover:text-foreground">{label}</Link> : <span className="text-fg-2" aria-current={current ? 'page' : undefined}>{label}</span>}
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
    <header className={cn('relative border-b border-border/50 pt-[calc(var(--header-h)+20px)] md:pt-[calc(var(--header-h)+28px)]', className)}>
      <div className="container-x">
        <div className="relative">
          <Crumbs crumbs={crumbs} />
          {children}
        </div>
      </div>
    </header>
  );
}

export type MastheadStat = { value: number | string; label: React.ReactNode };

/** 写在句子里的数字：香槟金、等宽 */
export function MastNum({ children }: { children: React.ReactNode }) {
  return <span className="tabular font-medium tabular-nums text-primary">{children}</span>;
}

/**
 * 索引页刊头 —— 彻底做减法 · 极简舒适（Quiet Luxury）：
 * 彻底消除一切“01 02 03 卡片”、死气沉沉的黑色空洞与虚浮的数据行。
 * 仅保留轻盈的面包屑、从容大方的标题与最克制的说明，把 100% 的视觉和操作空间交给正文内容。
 */
export function IndexMasthead({
  title, count, description, glow, crumbs, aside, stats, children, className,
}: {
  title: React.ReactNode;
  count?: number | string;
  description?: React.ReactNode;
  glow?: string | null;
  crumbs?: Crumb[];
  aside?: React.ReactNode;
  stats?: MastheadStat[];
  children?: React.ReactNode;
  className?: string;
  // 保持向后兼容的未用字段
  no?: string;
  registry?: React.ReactNode;
  telemetry?: React.ReactNode;
  band?: React.ReactNode;
}) {
  return (
    <header className={cn('relative overflow-hidden border-b border-border/50 pt-[calc(var(--header-h)+20px)] pb-6 md:pt-[calc(var(--header-h)+26px)] md:pb-7', className)}>
      {/* 极简环境微光：若有游戏美术则渲染极其柔和的背景氛围，无则留白自然 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {glow ? (
          <>
            <img src={glow} alt="" className={cn(GLOW_IMG, 'opacity-15')} />
            <div className={GLOW_VEIL} />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_20%_0%,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container-x relative">
        <Crumbs crumbs={crumbs ?? [[title]]} />
        
        <div className="mt-3 max-w-4xl">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.013em] text-foreground sm:text-4xl lg:text-[44px]">
              {title}
            </h1>
            {count != null && (
              <span className="tabular text-xs sm:text-sm text-fg-3 tabular-nums">
                ({count})
              </span>
            )}
          </div>
          {description && (
            <p className="mt-3 max-w-[56em] text-base leading-[1.75] text-fg-2 text-pretty">
              {description}
            </p>
          )}
        </div>

        {/* 仅在特定页面（如关于页）作为补充插槽渲染 */}
        {aside && <div className="mt-4">{aside}</div>}
        {stats?.length ? (
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-border/40 pt-3">
            {stats.map((s, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <dt className="text-xs text-fg-3">{s.label}</dt>
                <dd className={cn('tabular text-base font-bold tabular-nums', i === 0 ? 'text-primary' : 'text-foreground')}>{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {children}
      </div>
    </header>
  );
}
