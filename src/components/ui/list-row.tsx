import { T } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 列表行——资源站、工具、教程列表与各详情页里的条目共用同一种行：
 *   左侧图标（可选）→ 标题行（小字前缀 / 标题 / 旁注 / 徽标）→ 一句说明 → 一行元信息；整行可点。
 *
 * 层级靠字体区分，而不是靠字号堆叠：分节标题是宋体（标题的声音），条目标题是黑体半粗（内容的声音），
 * 说明是浅灰正文，元信息是更小的灰字——主次一眼可辨。
 * 悬停 / 键盘聚焦：底色提亮、标题变金色、箭头移动。不用左侧竖条。
 * external：整行是外链（新窗口打开，箭头朝右上）；health="dead" 时整行不可点并标「已失效」。
 * 分隔线由外层列表负责（border-b），行本身不画边框。
 */
export function ListRow({
  href, external, health, media, eyebrow, title, aside, badge, description, meta, className,
}: {
  href: string; external?: boolean; health?: string; media?: React.ReactNode; eyebrow?: React.ReactNode; title: React.ReactNode;
  aside?: React.ReactNode; badge?: React.ReactNode; description?: React.ReactNode; meta?: React.ReactNode; className?: string;
}) {
  const dead = external && health === 'dead';
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const body = (
    <>
      {media}
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-sm text-fg-3">{eyebrow}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className={cn('text-lg font-semibold leading-snug transition-colors duration-200 md:text-xl', dead ? 'text-fg-3 line-through' : 'group-hover:text-primary')}>{title}</h3>
          {aside && <span className="text-sm text-fg-3">{aside}</span>}
          {badge}
          {dead && <span className="font-mono text-2xs text-bad"><T zh="已失效" en="Broken" /></span>}
        </div>
        {description && <p className="mt-1.5 max-w-[62ch] text-base leading-[1.7] text-fg-2 text-pretty">{description}</p>}
        {meta && <p className="mt-2.5 text-sm text-fg-3">{meta}</p>}
      </div>
      <Arrow aria-hidden className={cn('mt-1 size-5 text-fg-3 transition-[transform,color] duration-200', !dead && (external ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary' : 'group-hover:translate-x-1 group-hover:text-primary'))} />
      {external && !dead && <span className="sr-only"><T zh="（在新窗口打开）" en="(opens in a new window)" /></span>}
    </>
  );
  const cls = cn(
    'group relative grid items-start gap-x-5 px-4 py-5 outline-none transition-colors duration-200 md:px-5',
    !dead && 'hover:bg-card focus-visible:bg-card',
    media ? 'grid-cols-[44px_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
    className,
  );
  if (dead) return <div aria-disabled="true" className={cls}>{body}</div>;
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>;
  return <Link href={href} className={cls}>{body}</Link>;
}
