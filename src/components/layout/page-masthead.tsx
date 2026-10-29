import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AmbientArt } from '@/components/fx/ambient-art';
import { T } from '@/lib/i18n';

type Crumb = [React.ReactNode, string?];

function Crumbs({ crumbs }: { crumbs?: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex max-w-full flex-wrap items-center gap-2 text-xs text-fg-3">
      <Link href="/" className="transition-colors hover:text-foreground"><T zh="首页" en="Home" /></Link>
      {(crumbs ?? ([[<T key="i" zh="索引" en="Index" />]] as Crumb[])).map(([label, href], i, all) => {
        const current = !href;
        return (
          <span key={i} className={cn('items-center gap-2', current && i === all.length - 1 ? 'hidden sm:flex' : 'flex')}>
            <span aria-hidden className="text-fg-3/60">›</span>
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
    <header className={cn('relative pt-[calc(var(--header-h)+20px)] md:pt-[calc(var(--header-h)+28px)]', className)}>
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

/** 写在句子里的数字：白、等宽数字 */
export function MastNum({ children }: { children: React.ReactNode }) {
  return <span className="tabular font-medium tabular-nums text-foreground">{children}</span>;
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
    <header className={cn('relative pt-[calc(var(--header-h)+28px)] pb-6 md:pt-[calc(var(--header-h)+48px)] md:pb-10', className)}>
      {/* 美术环境光：有游戏美术时，页面顶部被这款游戏的颜色照亮，向下渐隐；没有时留纯黑 */}
      <AmbientArt src={glow} height="h-[80vh]" opacity={0.5} />
      <div className="container-x relative">
        <Crumbs crumbs={crumbs ?? [[title]]} />
        
        <div className="mt-3 max-w-4xl">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[56px]">
              {title}
            </h1>
            {count != null && (
              <span className="tabular text-lg sm:text-xl font-normal text-fg-3 tabular-nums">
                {count}
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
                <dd className={cn('tabular text-base font-bold tabular-nums', 'text-foreground')}>{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {children}
      </div>
    </header>
  );
}
