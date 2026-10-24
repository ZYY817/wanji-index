import { cn } from '@/lib/utils';

// 跑马灯：纯 CSS（transform 动画），悬停暂停；reduced-motion 下静止（见 globals.css .marquee-track）
export function Marquee({
  children, reverse, duration = 60, className, gap = 12,
}: { children: React.ReactNode; reverse?: boolean; duration?: number; className?: string; gap?: number }) {
  return (
    <div className={cn('marquee overflow-hidden', className)}>
      <div
        className={cn('marquee-track flex w-max', reverse ? 'animate-marquee-rev' : 'animate-marquee')}
        style={{ ['--marquee-dur' as any]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center" style={{ gap, paddingRight: gap }}>{children}</div>
        <div className="flex shrink-0 items-center" style={{ gap, paddingRight: gap }} aria-hidden inert>{children}</div>
      </div>
    </div>
  );
}
