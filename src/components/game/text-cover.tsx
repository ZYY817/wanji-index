import { cn } from '@/lib/utils';
import { hashHue } from '@/lib/monogram';

// 文字封面：图片缺失 / 404 时的设计化回退（不是灰块，也不是渐变占位）
// 形制＝档案室里的「暂无图像」卡：近黑底、单色索引条、宋体片名、mono 编号与细线框。
export function TextCover({
  name, en, seed, variant = 'poster', className,
}: { name: string; en?: string; seed: string; variant?: 'poster' | 'wide'; className?: string }) {
  const h = hashHue(seed);
  const accent = `oklch(0.72 0.12 ${h})`;
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 overflow-hidden bg-[#0C0C0A] text-foreground', className)}
    >
      {variant === 'poster' && <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />}
      <span className="pointer-events-none absolute inset-[7%] border border-white/10" />
      {variant === 'wide' && (
        <span aria-hidden className="pointer-events-none absolute inset-[9%] opacity-30">
          <span className="absolute inset-x-0 top-1/2 h-px bg-foreground/40" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/40" />
          <span className="absolute inset-x-0 top-[28%] h-px bg-foreground/20" />
          <span className="absolute inset-x-0 bottom-[28%] h-px bg-foreground/20" />
          <span className="absolute inset-y-0 left-[28%] w-px bg-foreground/20" />
          <span className="absolute inset-y-0 right-[28%] w-px bg-foreground/20" />
        </span>
      )}

      {variant === 'wide' ? (
        <div className="relative flex h-full flex-col justify-between p-[5%]">
          {/* 缺图时的宽幅封面：像一块待冲印的片基——只有暗部辉光、巨型首字与档案线，不抢正文 */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(circle at 76% 30%, ${accent}, transparent 56%)`, opacity: 0.16 }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-[3%] top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(180px,24vw,400px)] font-black leading-none tracking-[-0.08em] text-outline opacity-[0.22] [--stroke-w:1.5px] [--stroke-c:var(--color-fg-3)]"
          >
            {name.trim().charAt(0)}
          </span>
          <span aria-hidden className="pointer-events-none absolute inset-x-[5%] top-[38%] h-px bg-foreground/10" />
        </div>
      ) : (
        <div className="relative flex h-full flex-col justify-between p-[8%]">
          <div className="flex items-start justify-between gap-3">
            <span className="meta text-2xs text-fg-3">档案 · {String(h).padStart(3, '0')}</span>
            <span aria-hidden className="font-serif text-[clamp(24px,3vw,44px)] font-black leading-none text-outline opacity-40 [--stroke-c:var(--color-fg-2)] [--stroke-w:1px]">
              {String(h).padStart(3, '0')}
            </span>
          </div>
          <div>
            <span className="line-clamp-3 block font-serif text-[clamp(20px,2.4vw,34px)] font-black leading-[1.06] tracking-[-0.04em]">{name}</span>
            {en && <span className="meta mt-2 block text-2xs text-fg-3">{en}</span>}
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-3">
            <span />
            <span className="h-px w-8" style={{ background: accent }} />
          </div>
        </div>
      )}
    </div>
  );
}
