import Link from 'next/link';
import { cn } from '@/lib/utils';
import { T } from '@/lib/i18n';

export type DetailFact = { label: React.ReactNode; value: React.ReactNode };

/**
 * 详情页刊头（资源站 / 工具 / 教程）：左边回答「这是什么」，右边回答「怎么去 + 关键事实」。
 *   左：面包屑 → 类别（kicker）→ 标题 → 一句话简介
 *   右：主操作按钮 → 事实清单（用途、语言、版本、核验日期等）
 * 入场用 CSS rise 错峰，首帧可读；游戏档案页有自己的电影式首屏（DetailHero），不走这里。
 */
export function DetailMasthead({
  crumbs, kicker, mark, title, summary, action, facts, notice, className,
}: {
  crumbs: [React.ReactNode, string?][]; kicker?: React.ReactNode; mark?: React.ReactNode; title: React.ReactNode; summary?: React.ReactNode;
  action?: React.ReactNode; facts?: DetailFact[]; notice?: React.ReactNode; className?: string;
}) {
  const rise = (i: number) => ({ animationDelay: `${0.08 + i * 0.07}s` });
  return (
    <header className={cn('border-b border-border pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+64px)]', className)}>
      <div className="container-x grid gap-10 pb-12 md:pb-16 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <nav aria-label="Breadcrumb" className="flex animate-rise flex-wrap items-center gap-2 text-sm text-fg-2" style={rise(0)}>
            <Link href="/" className="transition-colors hover:text-foreground"><T zh="首页" en="Home" /></Link>
            {crumbs.map(([label, href], i) => (
              <span key={i} className="flex items-center gap-2">
                <span aria-hidden className="text-fg-3">/</span>
                {href ? (
                  <Link href={href} className="transition-colors hover:text-foreground">{label}</Link>
                ) : (
                  <span aria-current="page" className="text-foreground">{label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="mt-10 flex animate-rise items-center gap-4" style={rise(1)}>
            {mark}
            {kicker && <p className="text-sm text-fg-2">{kicker}</p>}
          </div>
          <h1 className="mt-4 animate-rise break-words font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl leading-tight" style={rise(2)}>
            {title}
          </h1>
          {summary && (
            <div className="mt-5 max-w-[38em] animate-rise text-lg leading-[1.75] text-fg-2 text-pretty" style={rise(3)}>
              {summary}
            </div>
          )}
        </div>

        {(action || facts?.length) && (
          <aside className="animate-rise lg:col-span-5 lg:col-start-8 lg:self-end" style={rise(3)}>
            {action}
            {facts?.length ? (
              <dl className={cn('border-t border-border-strong', action && 'mt-6')}>
                {facts.map((f, i) => (
                  <div key={i} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-border py-3.5 text-sm">
                    <dt className="text-sm text-fg-2">{f.label}</dt>
                    <dd className="leading-[1.7] text-foreground">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </aside>
        )}
      </div>
      {notice && <div className="container-x pb-10">{notice}</div>}
    </header>
  );
}

/** 访问前须知 / 使用前须知：细边框浅底，用在刊头下方 */
export function Notice({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-sm bg-warn/[0.06] px-5 py-4 ring-1 ring-warn/25">
      <p className="text-sm font-medium text-warn">{title}</p>
      <div className="mt-2 space-y-2 text-base leading-[1.75] text-fg-2">{children}</div>
    </div>
  );
}
