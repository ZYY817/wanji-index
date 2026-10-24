'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { Art } from '@/lib/present';
import { GameArt } from '@/components/game/game-art';
import { GameLogo } from '@/components/game/game-logo';
import { useIsDesktop, useMotionOK } from '@/components/fx/hooks';

/**
 * 游戏档案首屏：全出血官方美术 + 片名。
 * 滚动镜头（只动 transform / opacity）：美术缓慢推近并下沉，文字以更快的速度上移并淡出，
 * 底部压暗逐渐加深，把视线交给下面的「速答条」。入场用纯 CSS 错峰，首帧即可读。
 */
export function DetailHero({
  id, name, enName, summary, tags, art,
}: { id: string; name: string; enName?: string; summary: string; tags: string[]; art: Art }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const k = ok ? (desktop ? 1 : 0.5) : 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const artScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.04 + 0.14 * k]);
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', `${10 * k}%`]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -160 * k]);
  const textFade = useTransform(scrollYProgress, [0.1, 0.7], [1, ok ? 0 : 1]);
  const shade = useTransform(scrollYProgress, [0, 0.9], [0, 0.65 * k]);

  const rise = (i: number) => ({ animationDelay: `${0.12 + i * 0.08}s` });

  return (
    <section ref={ref} aria-label={`${name} 档案首屏`} className="grain relative flex min-h-[88svh] items-end overflow-hidden bg-shell md:min-h-[92svh]">
      <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ scale: artScale, y: artY }}>
        <GameArt src={art?.hero} name={name} en={enName} seed={id} variant="wide" priority className="absolute inset-0" imgClassName="object-[60%_30%]" />
      </motion.div>
      {/* 压暗：左下给文字，右上留给美术 */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,18,17,0.9)_0%,rgba(19,18,17,0.55)_42%,rgba(19,18,17,0.1)_75%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,#131211_0%,rgba(19,18,17,0.72)_26%,rgba(19,18,17,0)_62%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(19,18,17,0.7),transparent)]" />
      <motion.div aria-hidden className="absolute inset-0 bg-background" style={{ opacity: shade }} />

      <motion.div className="container-x relative z-10 w-full pb-12 pt-[calc(var(--header-h)+48px)] md:pb-16" style={{ y: textY, opacity: textFade }}>
        <nav aria-label="面包屑" className="flex animate-rise items-center gap-2 text-sm text-fg-2" style={rise(0)}>
          <Link href="/" className="transition-colors hover:text-foreground">首页</Link>
          <span aria-hidden className="text-fg-3">/</span>
          <Link href="/games/" className="transition-colors hover:text-foreground">游戏库</Link>
          <span aria-hidden className="text-fg-3">/</span>
          <span aria-current="page" className="text-foreground">{name}</span>
        </nav>

        <div className="mt-6 grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <h1 className="animate-rise font-serif text-[clamp(52px,8vw,128px)] font-black leading-[0.98] tracking-[-0.05em]" style={rise(1)}>
              {name}
            </h1>
            <p className="mt-5 flex animate-rise flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2" style={rise(2)}>
              {enName && <span className="text-foreground/85">{enName}</span>}
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-3">
                  <span aria-hidden className="size-1 bg-fg-3" />
                  {t}
                </span>
              ))}
            </p>
            <p className="mt-5 max-w-[42ch] animate-rise text-lg leading-[1.75] text-foreground/85 md:text-xl md:leading-[1.7]" style={rise(3)}>
              {summary}
            </p>
          </div>
          {art?.logo && (
            <div className="hidden animate-rise justify-end md:col-span-4 md:flex" style={rise(2)}>
              <GameLogo src={art.logo} className="h-auto max-h-[180px] w-full max-w-[320px] object-contain object-right drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]" />
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
