import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CropMarks } from '@/components/ui/crop-marks';

type Crumb = [string, string?];

/**
 * 页头外框：面包屑 + Nº 索引 + 印刷裁切线。内页索引章用自定义版式填充，详情页由 PageMasthead 复用。
 * 裁切线绝对定位在容器四角，随外框高度自适应，不参与布局。
 */
export function PageMastheadFrame({
  no, en, crumbs, children, className,
}: {
  no: string; en: string; crumbs?: Crumb[]; children: React.ReactNode; className?: string;
}) {
  return (
    <header className={cn('relative border-b border-border pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+64px)]', className)}>
      <div className="container-x">
        <div className="relative">
          <CropMarks size={10} inset={-1} className="text-fg-3/60" />
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
            <span className="ml-auto whitespace-nowrap pr-3">Nº {no} — {en}</span>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}

// 详情页刊头：面包屑 + Nº 编号 + 超大宋体标题（右上角 mono 计数）+ 右侧不对称说明。
// 索引页改用 PageMastheadFrame 自排章节版面；这里的默认排式保持不变以兼容所有详情页。
export function PageMasthead({
  no, en, title, count, description, crumbs, children, className, outline,
}: {
  no: string; en: string; title: string; count?: number; description?: React.ReactNode;
  crumbs?: Crumb[]; children?: React.ReactNode; className?: string; outline?: string;
}) {
  return (
    <PageMastheadFrame no={no} en={en} crumbs={crumbs ?? [[title]]} className={className}>
      <div className="grid items-end gap-6 pb-10 pt-8 md:grid-cols-12 md:pb-14 md:pt-12">
        <h1 className="display-m relative md:col-span-8">
          {title}
          {outline && <span className="text-outline [--stroke-c:var(--color-fg-3)] [--stroke-w:1px]">{outline}</span>}
          {count != null && (
            <sup className="ml-2 align-top font-mono text-sm font-normal tracking-[0.08em] text-primary md:text-base">
              {String(count).padStart(3, '0')}
            </sup>
          )}
        </h1>
        {description && <div className="max-w-[46ch] text-base leading-[1.8] text-fg-2 md:col-span-4 md:pb-2">{description}</div>}
      </div>
      {children}
    </PageMastheadFrame>
  );
}
