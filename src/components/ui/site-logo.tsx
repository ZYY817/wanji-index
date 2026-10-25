import { withBase } from '@/lib/base';
import { cn } from '@/lib/utils';
import LOGOS from '@/lib/site-logos.json';
import { Monogram } from './monogram';

const MAP = LOGOS as Record<string, string>;

/**
 * 资源站标识：优先显示站点自己的官方图标（scripts/fetch-logos.mjs 下载到 public/logos，构建时即是本地文件），
 * 没有图标时回退到字母图章。图标放在统一尺寸的底板里，保证不同来源、不同形状的 logo 排在一起也整齐。
 */
export function SiteLogo({
  id, name, size = 40, tone = 'dark', className,
}: { id: string; name: string; size?: number; tone?: 'dark' | 'paper'; className?: string }) {
  const src = MAP[id];
  if (!src) return <Monogram seed={id} name={name} size={size} tone={tone === 'paper' ? 'ink' : 'color'} className={className} />;
  return (
    <span
      aria-hidden
      className={cn(
        'inline-grid shrink-0 place-items-center overflow-hidden rounded-sm',
        tone === 'paper' ? 'bg-white ring-1 ring-ink/10' : 'bg-white/[0.06] ring-1 ring-white/10',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img src={withBase(src)} alt="" loading="lazy" decoding="async" className="size-[68%] object-contain" />
    </span>
  );
}
