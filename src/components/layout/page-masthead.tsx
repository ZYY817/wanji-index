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
    <header className={cn('relative pt-[calc(var(--header-h)+32px)] pb-8 md:pt-[calc(var(--header-h)+64px)] md:pb-14', className)}>
      {/* 美术环境光：有游戏美术时，页面顶部被这款游戏的颜色照亮；没有时只留一层很淡的顶光，避免纯黑平涂 */}
      {glow ? (
        <AmbientArt src={glow} height="h-[80vh]" opacity={0.5} />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(60%_70%_at_30%_0%,rgba(255,255,255,0.07),transparent_70%)]" />
      )}

      <div className="container-x relative">
        <Crumbs crumbs={crumbs ?? [[title]]} />

        {/* 宽屏：标题在左，说明在右并与标题底部对齐——占满整行，不再左上角一小块、右边一大片空 */}
        <div className="mt-4 grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="flex items-baseline gap-3 lg:col-span-6">
            <h1 className="font-display text-[clamp(40px,5.2vw,72px)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              {title}
            </h1>
            {count != null && (
              <span className="tabular text-xl font-normal text-fg-3 tabular-nums sm:text-2xl">
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className="max-w-[40em] text-[17px] leading-[1.7] text-fg-2 text-pretty lg:col-span-6 lg:pb-2">
              {description}
            </p>
          )}
        </div>

        {/* 仅在特定页面（如关于页）作为补充插槽渲染 */}
        {aside && <div className="mt-8">{aside}</div>}
        {stats?.length ? (
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
            {stats.map((s, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <dt className="text-sm text-fg-3">{s.label}</dt>
                <dd className="tabular text-lg font-semibold tabular-nums text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {children}
      </div>
    </header>
  );
}
