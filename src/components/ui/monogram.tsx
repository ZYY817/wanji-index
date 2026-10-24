import { cn } from '@/lib/utils';
import { monogramChar, monogramColors } from '@/lib/monogram';

// 资源站字母头像（全站母题）：首字（母）+ id 哈希色相，OKLCH 同明度同彩度；不取外部 favicon
// tone="ink"：纸面目录用的单色图章，避免彩色块在纸面上读成 App 图标
export function Monogram({
  seed, name, size = 40, tone = 'color', className,
}: { seed: string; name: string; size?: number; tone?: 'color' | 'ink'; className?: string }) {
  const c = monogramColors(seed);
  const ch = monogramChar(name);
  const cjk = !/[A-Z0-9]/.test(ch);
  const ink = tone === 'ink';
  return (
    <span
      aria-hidden
      className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-xs font-serif font-black leading-none', className)}
      style={{
        width: size, height: size,
        background: ink ? 'transparent' : c.bg,
        color: ink ? 'var(--color-ink)' : c.fg,
        boxShadow: ink
          ? 'inset 0 0 0 1.5px color-mix(in oklab, var(--color-ink) 52%, transparent)'
          : `inset 0 0 0 1px ${c.line}`,
        fontSize: size * (cjk ? 0.5 : 0.56),
      }}
    >
      {ch}
      {!ink && (
        <span className="absolute bottom-[3px] right-[4px] font-mono text-2xs font-medium tracking-normal opacity-70" style={{ fontSize: Math.max(6, size * 0.15) }}>
          {String(c.hue).padStart(3, '0')}
        </span>
      )}
    </span>
  );
}
