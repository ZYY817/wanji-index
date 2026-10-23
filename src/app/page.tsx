import type { Metadata } from 'next';

export const metadata: Metadata = { alternates: { canonical: '/' } };

// 首页：Hero（搜索即功能）→ 游戏卡片栅格 → 免费快报 → 资源站/工具/教程三栏
import Link from 'next/link';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { GameCard } from '@/components/game-card';
import { OfferCard } from '@/components/offer-card';
import { computeLifecycle } from '@/lib/lifecycle.mjs';
import { zh } from '@/lib/labels.mjs';
import site from '../../config/site.json';
import { HeroSearch } from '@/components/hero-search';
import { FadeIn } from '@/components/motion';
import { Gamepad2, Gift, Library, Wrench, BookOpen } from 'lucide-react';

const ENTRIES = [
  { href: '/games/', Icon: Gamepad2, label: '游戏库', desc: '一个游戏一份完整资源档案' },
  { href: '/free/', Icon: Gift, label: '免费游戏', desc: '限免·试玩·开源，时效自动判定' },
  { href: '/resources/', Icon: Library, label: '资源站', desc: 'MOD·汉化·攻略可信入口' },
  { href: '/tools/', Icon: Wrench, label: '工具', desc: 'MOD管理·存档·性能工具' },
  { href: '/guides/', Icon: BookOpen, label: '教程排查', desc: '报错排查·操作指南' },
];

export default function Home() {
  const data = loadData();
  const rel = buildRelations(data);
  const now = Date.now();
  const games = [...data.games].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);
  const offers = data.offers.filter((o) => computeLifecycle(o, now, site.review.staleDays.offerTimed) === 'active').slice(0, 6);
  const counts = (gid: string) => [
    (rel.entriesByGame.get(gid)?.length ?? 0) && `MOD${rel.entriesByGame.get(gid)!.length}`,
    (rel.toolsByGame.get(gid)?.length ?? 0) && `工具${rel.toolsByGame.get(gid)!.length}`,
    (rel.guidesByGame.get(gid)?.length ?? 0) && `教程${rel.guidesByGame.get(gid)!.length}`,
  ].filter(Boolean).join(' ');

  return (
    <div>
      {/* Hero：琥珀光晕 + 大标题 + 大搜索 */}
      <section className="relative overflow-hidden border-b border-[var(--color-line-0)]">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[420px] w-[640px] rounded-full opacity-[0.16] blur-[110px]" style={{ background: 'radial-gradient(closest-side, var(--color-amber), transparent)' }} />
        <div className="pointer-events-none absolute -right-32 top-10 h-[320px] w-[420px] rounded-full opacity-[0.09] blur-[100px]" style={{ background: 'radial-gradient(closest-side, var(--color-info), transparent)' }} />
        <div className="wrap relative py-16 md:py-24">
          <p className="mono mb-4 text-[var(--color-amber)]">已收录 {data.games.length} 游戏 · {data.sites.length} 资源站 · {data.tools.length} 工具 · {data.guides.length} 教程</p>
          <h1 className="max-w-[14em] text-4xl font-black leading-[1.15] tracking-[-0.02em] md:text-5xl">
            找到游戏，<br />然后<span className="text-[var(--color-amber-hi)]">解决一切</span>。
          </h1>
          <p className="mt-4 max-w-[36em] text-[var(--color-txt-2)]">
            每个游戏一份完整资源档案：正版渠道、免费情报、MOD/汉化、实用工具、报错排查——只指向可信来源。
          </p>
          <div className="mt-7 max-w-[560px]"><HeroSearch /></div>
          <div className="mt-8 flex flex-wrap gap-3">
            {ENTRIES.map((e, i) => (
              <FadeIn key={e.href} delay={0.05 * i}>
                <Link href={e.href} className="card flex items-center gap-3 px-4 py-3">
                  <e.Icon size={20} className="text-[var(--color-amber-hi)]" />
                  <span>
                    <span className="block text-sm font-semibold">{e.label}</span>
                    <span className="block text-xs text-[var(--color-txt-3)]">{e.desc}</span>
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 游戏档案 */}
      <section className="wrap py-12">
        <div className="sect"><h2>游戏档案</h2><Link href="/games/" className="text-sm text-[var(--color-amber-hi)]">全部 {data.games.length} 款 →</Link></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((g, i) => <FadeIn key={g.id} delay={0.04 * i}><GameCard game={g} counts={counts(g.id)} /></FadeIn>)}
        </div>
      </section>

      {/* 免费快报 */}
      {offers.length > 0 && (
        <section className="wrap pb-12">
          <div className="sect"><h2>免费快报</h2><Link href="/free/" className="text-sm text-[var(--color-amber-hi)]">全部 →</Link></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o, i) => <FadeIn key={o.id} delay={0.05 * i}><OfferCard offer={o} now={now} /></FadeIn>)}
          </div>
        </section>
      )}

      {/* 三栏：资源站 / 工具 / 教程 */}
      <section className="wrap grid grid-cols-1 gap-8 pb-16 md:grid-cols-3">
        <div>
          <div className="sect"><h2>资源站</h2><Link href="/resources/" className="text-sm text-[var(--color-amber-hi)]">→</Link></div>
          {data.sites.slice(0, 5).map((s) => (
            <Link key={s.id} href={`/resources/${s.slug}/`} className="irow !border-b-0 !py-2.5">
              <span className="font-medium">{s.name}</span>
              <span className="tag ml-auto">{zh('siteCategory', s.category)}</span>
            </Link>
          ))}
        </div>
        <div>
          <div className="sect"><h2>工具</h2><Link href="/tools/" className="text-sm text-[var(--color-amber-hi)]">→</Link></div>
          {data.tools.slice(0, 5).map((t) => (
            <Link key={t.id} href={`/tools/${t.slug}/`} className="irow !border-b-0 !py-2.5">
              <span className="font-medium">{t.name}</span>
              <span className="tag ml-auto">{zh('toolType', t.type)}</span>
            </Link>
          ))}
        </div>
        <div>
          <div className="sect"><h2>教程</h2><Link href="/guides/" className="text-sm text-[var(--color-amber-hi)]">→</Link></div>
          {data.guides.slice(0, 5).map((g) => (
            <Link key={g.id} href={`/guides/${g.slug}/`} className="irow !border-b-0 !py-2.5">
              <span className="font-medium">{g.title}</span>
              <span className="tag ml-auto">{zh('guideKind', g.kind)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
