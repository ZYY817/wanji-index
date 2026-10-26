import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 列表行——资源站、工具、教程三个列表共用同一种行：
 *   左侧图标（可选）→ 标题行（小字前缀 / 标题 / 旁注 / 徽标）→ 一句说明 → 一行元信息；整行可点。
 * 悬停或键盘聚焦时：底色提亮、左侧出现香槟金竖条、标题变金色、箭头右移——一眼看出「选中的是哪一行」。
 * 分隔线由外层列表负责（border-b），行本身不画边框。
 */
export function ListRow({
  href, media, eyebrow, title, aside, badge, description, meta, className,
}: {
  href: string; media?: React.ReactNode; eyebrow?: React.ReactNode; title: React.ReactNode; aside?: React.ReactNode;
  badge?: React.ReactNode; description?: React.ReactNode; meta?: React.ReactNode; className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative grid items-start gap-x-5 px-4 py-6 outline-none transition-colors duration-200 hover:bg-card focus-visible:bg-card md:px-5',
        media ? 'grid-cols-[48px_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] origin-center scale-y-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-y-100 group-focus-visible:scale-y-100" />
      {media}
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-sm text-fg-3">{eyebrow}</p>}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="font-serif text-xl font-bold leading-snug transition-colors duration-200 group-hover:text-primary md:text-2xl">{title}</h3>
          {aside && <span className="text-sm text-fg-3">{aside}</span>}
          {badge}
        </div>
        {description && <p className="mt-2 max-w-[62ch] text-base leading-[1.7] text-fg-2 text-pretty">{description}</p>}
        {meta && <p className="mt-3 text-sm text-fg-3">{meta}</p>}
      </div>
      <ArrowRight aria-hidden className="mt-1.5 size-5 text-fg-3 transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
