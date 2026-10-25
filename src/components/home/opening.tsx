'use client';
import type { GameVM } from '@/lib/present';
import type { DossierVM } from '@/lib/home-data';
import { useMedia, useMotionOK, useMounted } from '@/components/fx/hooks';
import { Film } from './film';
import { Hero } from './hero';
import { PosterWall } from './poster-wall';
import { Anatomy } from './anatomy';

/**
 * 首页开场段：桌面（≥1280px、允许动效）播放连续镜头 Film；
 * 小屏 / reduced-motion 回退到三个独立的静态友好章节。SSR 先输出 Film 的第一帧（与桌面首帧一致，不闪）。
 */
export function Opening({ heroes, popular, wall, total, sites, offers, d }: {
  heroes: GameVM[]; popular: GameVM[]; wall: GameVM[]; total: number; sites: number; offers: number; d: DossierVM;
}) {
  const mounted = useMounted();
  const ok = useMotionOK();
  const wide = useMedia('(min-width: 1280px)');
  if (mounted && !(ok && wide)) {
    return (
      <>
        <Hero heroes={heroes} popular={popular} counts={{ games: total, sites, offers }} />
        <PosterWall games={wall} total={total} />
        <Anatomy d={d} />
      </>
    );
  }
  return <Film lead={heroes[0]} popular={popular} wall={wall} total={total} d={d} />;
}
