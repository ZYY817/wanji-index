import { cn } from '@/lib/utils';
import { hashHue } from '@/lib/monogram';

// 文字封面：图片缺失 / 404 时的设计化回退。
// 形制＝按名称散列出一组相邻色相，铺成柔和的弥散渐变底（像系统壁纸），正中一枚圆角方形「图标」放首字，下方片名。
// 不同游戏颜色不同但同属一个体系；不是灰块，也不抢真实美术的风头。
export function TextCover({
  name, en, seed, variant = 'poster', className,
}: { name: string; en?: string; seed: string; variant?: 'poster' | 'wide'; className?: string }) {
  const h = hashHue(seed);
  const c1 = `oklch(0.42 0.11 ${h})`;
  const c2 = `oklch(0.3 0.09 ${(h + 40) % 360})`;
  const c3 = `oklch(0.2 0.05 ${(h + 300) % 360})`;
  const glyph = (name.trim().match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase();
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 overflow-hidden text-foreground', className)}
      style={{ background: `radial-gradient(120% 80% at 20% 0%, ${c1} 0%, transparent 60%), radial-gradient(90% 70% at 100% 100%, ${c2} 0%, transparent 65%), ${c3}` }}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.12),transparent)]" />
      {variant === 'wide' ? (
        <div className="relative flex h-full items-end p-[6%]">
          <span className="pointer-events-none absolute right-[6%] top-1/2 -translate-y-1/2 select-none font-display text-[clamp(120px,18vw,320px)] font-semibold leading-none tracking-[-0.04em] text-white/[0.08]">
            {glyph}
          </span>
        </div>
      ) : (
        <div className="relative flex h-full flex-col items-center justify-center gap-[8%] p-[10%] text-center">
          <span
            className="grid aspect-square w-[34%] place-items-center rounded-[24%] font-display text-[clamp(22px,3.2vw,44px)] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]"
            style={{ background: `linear-gradient(160deg, oklch(0.62 0.13 ${h}), oklch(0.42 0.12 ${(h + 30) % 360}))` }}
          >
            {glyph}
          </span>
          <span className="w-full">
            <span className="line-clamp-2 block font-display text-[clamp(15px,1.4vw,20px)] font-semibold leading-tight tracking-[-0.01em]">{name}</span>
            {en && en !== name && <span className="mt-1 block truncate text-xs text-white/55">{en}</span>}
          </span>
        </div>
      )}
    </div>
  );
}
