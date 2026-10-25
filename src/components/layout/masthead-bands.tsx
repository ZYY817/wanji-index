import Link from 'next/link';
import type { GameVM, OfferVM, SiteVM } from '@/lib/present';
import { Marquee } from '@/components/fx/marquee';
import { SiteLogo } from '@/components/ui/site-logo';
import { zh } from '@/lib/labels.mjs';
import { shDateTime } from '@/lib/time';

/*
 * 内页刊头的「内容带」：每页刊头下方缓缓流过的，就是这一页的东西本身。
 * 全部是纯 CSS 跑马灯（悬停暂停、reduced-motion 下静止），服务端渲染，不增加客户端脚本。
 */

/** 游戏库：海报 */
export function PosterBand({ games }: { games: GameVM[] }) {
  const list = games.filter((g) => g.art?.poster);
  return (
    <Marquee duration={110} gap={16}>
      {list.map((g) => (
        <Link key={g.id} href={`/games/${g.slug}/`} className="group block shrink-0" tabIndex={-1}>
          <span className="edge-light relative block h-[150px] w-[100px] overflow-hidden rounded-sm md:h-[186px] md:w-[124px]">
            <img src={g.art!.poster} alt={g.name} loading="lazy" decoding="async" className="size-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100" />
          </span>
        </Link>
      ))}
    </Marquee>
  );
}

/** 免费游戏：此刻免费的游戏（横幅 + 中文名 + 截止时间） */
export function OfferBand({ offers }: { offers: OfferVM[] }) {
  const list = offers.filter((o) => o.art?.hero && o.lifecycle !== 'ended');
  return (
    <Marquee duration={90} gap={20}>
      {list.map((o) => (
        <div key={o.id} className="w-[220px] shrink-0 md:w-[264px]">
          <span className="edge-light relative block aspect-[16/9] overflow-hidden rounded-sm">
            <img src={o.art!.hero} alt="" loading="lazy" decoding="async" className="size-full object-cover opacity-85" />
          </span>
          <p className="mt-3 truncate font-serif text-lg font-bold">{o.titleZh ?? o.title}</p>
          <p className="mt-0.5 text-sm text-fg-2">
            {zh('freeType', o.type)}
            <span className="text-fg-3"> · </span>
            {o.lifecycle === 'upcoming' && o.startMs ? <span className="text-info">{shDateTime(o.startMs)} 开始</span> : o.endMs ? `${shDateTime(o.endMs)} 截止` : '长期免费'}
          </p>
        </div>
      ))}
    </Marquee>
  );
}

/** 资源站：站标 + 站名 + 域名 */
export function LogoBand({ sites }: { sites: SiteVM[] }) {
  return (
    <Marquee duration={80} gap={44}>
      {sites.map((s) => (
        <Link key={s.id} href={`/resources/${s.slug}/`} className="group flex shrink-0 items-center gap-3" tabIndex={-1}>
          <SiteLogo id={s.id} name={s.name} size={44} tone="paper" className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-base text-foreground transition-colors group-hover:text-primary">{s.name}</span>
            <span className="block whitespace-nowrap font-mono text-2xs text-fg-3">{s.domain}</span>
          </span>
        </Link>
      ))}
    </Marquee>
  );
}

/** 工具：名字本身，宋体大字，用途作小注 */
export function NameBand({ items }: { items: { id: string; name: string; note: string; href: string }[] }) {
  return (
    <Marquee duration={70} gap={56}>
      {items.map((t) => (
        <Link key={t.id} href={t.href} className="group flex shrink-0 items-baseline gap-3" tabIndex={-1}>
          <span className="whitespace-nowrap font-serif text-[clamp(28px,3vw,44px)] font-black tracking-[-0.03em] text-foreground/85 transition-colors group-hover:text-primary">{t.name}</span>
          <span className="whitespace-nowrap text-sm text-fg-3">{t.note}</span>
        </Link>
      ))}
    </Marquee>
  );
}

/** 教程：真实的报错原文，等宽，像一段滚动的日志——教程就是从这些话开始的 */
export function ErrorBand({ lines }: { lines: string[] }) {
  // 两行都放全部报错，第二行错开半圈：每行都比屏幕宽，滚动时不会出现空档
  const half = Math.ceil(lines.length / 2);
  const second = [...lines.slice(half), ...lines.slice(0, half)];
  const row = (list: string[]) =>
    list.map((l, i) => (
      <span key={i} className="flex shrink-0 items-center gap-3 whitespace-nowrap font-mono text-sm text-fg-2">
        <span aria-hidden className="size-1.5 rounded-full bg-bad/80" />
        {l}
      </span>
    ));
  return (
    <div aria-hidden className="space-y-4">
      <Marquee duration={90} gap={48}>{row(lines)}</Marquee>
      <Marquee duration={110} gap={48} reverse>{row(second)}</Marquee>
    </div>
  );
}
