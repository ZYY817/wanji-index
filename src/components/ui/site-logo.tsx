import { withBase } from '@/lib/base';
import { cn } from '@/lib/utils';
import SITE_LOGOS from '@/lib/site-logos.json';
import TOOL_LOGOS from '@/lib/tool-logos.json';
import { Monogram } from './monogram';

type Tone = 'dark' | 'paper';

/**
 * 图标底板：不同来源、不同形状的官方图标放进统一尺寸的方形底板，排在一起也整齐；没有图标时回退到字母图章。
 * 图标都是构建时下载到 public/logos 的本地文件，访客端不请求第三方。
 */
function LogoTile({ src, seed, name, size, tone, className }: { src?: string; seed: string; name: string; size: number; tone: Tone; className?: string }) {
  if (!src) return <Monogram seed={seed} name={name} size={size} tone={tone === 'paper' ? 'ink' : 'color'} className={className} />;
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

/** 资源站图标（scripts/fetch-logos.mjs） */
export function SiteLogo({ id, name, size = 40, tone = 'dark', className }: { id: string; name: string; size?: number; tone?: Tone; className?: string }) {
  return <LogoTile src={(SITE_LOGOS as Record<string, string>)[id]} seed={id} name={name} size={size} tone={tone} className={className} />;
}

/** 工具图标（scripts/fetch-tool-logos.mjs） */
export function ToolLogo({ id, name, size = 40, tone = 'dark', className }: { id: string; name: string; size?: number; tone?: Tone; className?: string }) {
  return <LogoTile src={(TOOL_LOGOS as Record<string, string>)[id]} seed={id} name={name} size={size} tone={tone} className={className} />;
}
