import { STANDARD, VIEWBOX } from '@/lib/brand.mjs';
import { cn } from '@/lib/utils';

/**
 * 玩机索引品牌图形（对称的 W + 中间一颗独立菱形），颜色随文字（currentColor）。
 * 路径与图标、分享卡片共用 src/lib/brand.mjs。顶栏 22–26px 用标准版即可；16px 的浏览器标签图标另有小尺寸版。
 */
export function BrandMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox={VIEWBOX} fill="currentColor" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} className={cn('shrink-0', className)}>
      {title && <title>{title}</title>}
      {STANDARD.map((d) => <path key={d.slice(0, 12)} d={d} />)}
    </svg>
  );
}
