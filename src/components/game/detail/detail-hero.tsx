'use client';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll } from 'motion/react';
import type { Art } from '@/lib/present';
import { GameArt } from '@/components/game/game-art';
import { GameLogo } from '@/components/game/game-logo';
import { useIsDesktop, useMotionOK, useLiveTransform } from '@/components/fx/hooks';

/**
 * 游戏档案首屏：全出血官方美术 + 片名。
 * 滚动镜头（只动 transform / opacity）：美术缓慢推近并下沉，文字以更快的速度上移并淡出，
 * 底部压暗逐渐加深，把视线交给下面的「速答条」。入场用纯 CSS 错峰，首帧即可读。
 */
export function DetailHero({
  id, name, enName, summary, summaryEn, tags, byline, bylineEn, art,
}: { id: string; name: string; enName?: string; summary: string; summaryEn?: string; tags: React.ReactNode[]; byline?: string[]; bylineEn?: string[]; art: Art }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const k = ok ? (desktop ? 1 : 0.5) : 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const artScale = useLiveTransform(scrollYProgress, [0, 1], [1.04, 1.04 + 0.14 * k]);
  const artY = useLiveTransform(scrollYProgress, [0, 1], ['0%', `${10 * k}%`]);
  const textY = useLiveTransform(scrollYProgress, [0, 1], [0, -160 * k]);
  const textFade = useLiveTransform(scrollYProgress, [0.1, 0.7], [1, ok ? 0 : 1]);
  const shade = useLiveTransform(scrollYProgress, [0, 0.9], [0, 0.65 * k]);

  const rise = (i: number) => ({ animationDelay: `${0.12 + i * 0.08}s` });

  return (
    <section ref={ref} aria-label={name} className="relative flex min-h-[56svh] max-h-[620px] items-end overflow-hidden md:min-h-[62svh]">
      <motion.div aria-hidden className="absolute inset-0 will-change-transform [mask-image:linear-gradient(180deg,#000_35%,transparent_94%)]" style={{ scale: artScale, y: artY }}>
        <GameArt src={art?.hero} name={name} en={enName} seed={id} variant="wide" priority className="absolute inset-0" imgClassName="object-[60%_30%]" />
      </motion.div>
      {/* 压暗：左下给文字，右上留给美术 */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.4)_45%,rgba(0,0,0,0)_75%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.2)_30%,rgba(0,0,0,0)_60%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0.7),transparent)]" />
      <motion.div aria-hidden className="absolute inset-0 bg-background" style={{ opacity: shade }} />

      <motion.div className="container-x relative z-10 w-full pb-8 pt-[calc(var(--header-h)+28px)] md:pb-10" style={{ y: textY, opacity: textFade }}>
        <nav aria-label="Breadcrumb" className="flex animate-rise items-center gap-2 text-sm text-fg-2" style={rise(0)}>
          <Link href="/" className="transition-colors hover:text-foreground"><T zh="首页" en="Home" /></Link>
          <span aria-hidden className="text-fg-3">›</span>
          <Link href="/games/" className="transition-colors hover:text-foreground"><T zh="游戏库" en="Games" /></Link>
          <span aria-hidden className="text-fg-3">›</span>
          <span aria-current="page" className="text-foreground"><T zh={name} en={enName || name} /></span>
        </nav>

        <div className="mt-4 grid items-end gap-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-8">
            <h1 className="animate-rise font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={rise(1)}>
              <T zh={name} en={enName || name} />
            </h1>
            <p className="mt-3 flex animate-rise flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2" style={rise(2)}>
              {enName && enName !== name && <span className="font-medium text-foreground"><T zh={enName} en={name} /></span>}
              {tags.map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span aria-hidden className="size-1 rounded-full bg-fg-3" />
                  {t}
                </span>
              ))}
            </p>
            <p className="mt-3 max-w-[38em] animate-rise text-lg leading-relaxed text-foreground/90 text-pretty" style={rise(3)}>
              <T zh={summary} en={summaryEn} />
            </p>
            {byline && byline.length > 0 && (
              <p className="mt-3 animate-rise text-sm text-fg-2" style={rise(3)}><T zh={byline.join(' · ')} en={bylineEn?.length ? bylineEn.join(' · ') : undefined} /></p>
            )}
          </div>
          {art?.logo && (
            <div className="hidden animate-rise justify-end md:col-span-4 md:flex" style={rise(2)}>
              <GameLogo src={art.logo} className="h-auto max-h-[140px] w-full max-w-[280px] object-contain object-right drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]" />
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
