import Link from 'next/link';
import { cn } from '@/lib/utils';

type Crumb = [string, string?];

/**
 * 页头外框：面包屑 + 容器基础样式。内页索引章用自定义版式填充，详情页由 PageMasthead 复用。
 * 已按 V6 规范去除裁切角标与 Nº 编号装饰。
 */
export function PageMastheadFrame({
  no: _no, crumbs, children, className,
}: {
  no?: string; crumbs?: Crumb[]; children: React.ReactNode; className?: string;
}) {
  return (
    <header className={cn('relative border-b border-border pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+64px)]', className)}>
      <div className="container-x">
        <div className="relative">
          <div className="meta flex flex-wrap items-start gap-x-3 gap-y-1 text-fg-3">
            <nav aria-label="面包屑" className="flex max-w-full flex-none flex-wrap items-center gap-2">
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
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}

export type MastheadStat = { value: number | string; label: string };

/**
 * 索引页刊头（游戏库 / 免费游戏 / 资源站 / 工具 / 教程 / 搜索 / 关于 / 装机）：全站同一套三段式——
 * 标题（与顶栏导航同名）→ 一句说明 → 右侧 1–3 个关键数字。第一个数字用香槟金，其余白色。
 * `aside` 替换右侧数字栏（如装机页的产品状态板）；`children` 渲染在标题区下方（如关于页的版本信息）。
 */
export function IndexMasthead({
  no, title, description, stats, aside, crumbs, children, className,
}: {
  no?: string; title: React.ReactNode; description?: React.ReactNode; stats?: MastheadStat[];
  aside?: React.ReactNode; crumbs?: Crumb[]; children?: React.ReactNode; className?: string;
}) {
  const label = typeof title === 'string' ? title : undefined;
  return (
    <PageMastheadFrame no={no} crumbs={crumbs ?? (label ? [[label]] : undefined)} className={className}>
      <div className="grid gap-8 pb-10 pt-8 md:grid-cols-12 md:items-end md:gap-10 md:pb-12 md:pt-10">
        <div className="md:col-span-7">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h1>
          {description && (
            <div className="mt-5 max-w-[38em] text-lg leading-[1.75] text-fg-2 text-pretty">
              {description}
            </div>
          )}
        </div>
        {aside ? (
          <div className="md:col-span-5">{aside}</div>
        ) : stats?.length ? (
          <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-4 md:col-span-5 md:justify-end md:border-t-0 md:pt-0">
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-col-reverse gap-2">
                <dt className="text-sm text-fg-2">{s.label}</dt>
                <dd className={cn('font-mono text-4xl leading-none tracking-[-0.03em] tabular-nums md:text-5xl', i === 0 ? 'text-primary' : 'text-foreground')}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      {children}
    </PageMastheadFrame>
  );
}
