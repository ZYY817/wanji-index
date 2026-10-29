import { cn } from '@/lib/utils';

/**
 * 美术环境光（V10）：把游戏美术放大、强模糊、提高饱和度，铺在页面顶部背后，再向下渐隐到纯黑。
 * 页面因此有「被这款游戏的颜色照亮」的空气感，而不是平涂的黑底（苹果 TV App 的做法）。
 * 用小图（header 460×215）就够——模糊后看不出分辨率，体积也小。
 * -z-10：画在页面所有内容之下、根背景之上；外层若有不透明背景或 isolate，就只在那一层里生效。
 */
export function AmbientArt({ src, className, opacity = 0.65, height = 'h-[130vh]' }: { src?: string | null; className?: string; opacity?: number; height?: string }) {
  if (!src) return null;
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden [mask-image:linear-gradient(180deg,#000_0%,rgba(0,0,0,0.75)_35%,transparent_100%)]',
        height,
        className,
      )}
    >
      <img src={src} alt="" decoding="async" fetchPriority="low" className="absolute inset-0 size-full scale-125 object-cover" style={{ opacity, filter: 'blur(80px) saturate(1.6) brightness(1.1)' }} />
      {/* 压一层黑：环境光只是「气氛」，不能抢正文的对比度 */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(0,0,0,0.05),rgba(0,0,0,0.45))]" />
    </div>
  );
}
