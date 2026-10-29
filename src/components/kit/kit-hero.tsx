import { ArrowDown, Download } from 'lucide-react';
import { T } from '@/lib/i18n';
import { KIT, kitDate } from '@/lib/kit-release';
import { GithubMark } from './github-mark';
import { withBase } from '@/lib/base';

/**
 * 装机页首屏：与首页装机章同一套亮色展台（暖白空间 + 左上斜光）。
 * 左边回答「这是什么、去哪下」，右边是工具的真实界面截图（scripts/sync/kit-release.mjs 从 GitHub 同步）。
 */
export function KitHero() {
  const rise = (i: number) => ({ animationDelay: `${0.1 + i * 0.08}s` });
  const shot = KIT.shots.find((s) => s.name === 'idle') ?? KIT.shots[0];
  const count = KIT.catalog?.components.length ?? 0;

  return (
    <section aria-labelledby="kit-page-title" className="relative overflow-hidden bg-paper text-ink">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_38%),linear-gradient(0deg,rgba(201,192,176,0.45)_0%,transparent_35%)]" />
      <div aria-hidden className="absolute -left-[10%] top-[-20%] h-[140%] w-[38%] rotate-[28deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]" />

      <div className="container-x relative grid items-center gap-12 pb-16 pt-[calc(var(--header-h)+48px)] md:pb-24 lg:min-h-[92svh] lg:grid-cols-12 lg:gap-10 lg:pt-[calc(var(--header-h)+32px)]">
        <div className="lg:col-span-5">
          <p className="flex animate-rise flex-wrap items-center gap-3 text-sm text-ink-3" style={rise(0)}>
            <span className="inline-flex h-7 items-center gap-2 rounded-full border border-ink/20 px-3 text-ink">
              <span aria-hidden className="size-1.5 rounded-full bg-[#30D158]" />
              <T zh={`v${KIT.version} 已发布`} en={`v${KIT.version} released`} />
            </span>
            <span><T zh="玩机装机工具" en="Wanji Kit" /> · wanji-kit</span>
          </p>
          <h1 id="kit-page-title" className="mt-6 animate-rise font-display text-[clamp(40px,4.6vw,72px)] font-semibold leading-[1.08] tracking-[-0.018em]" style={rise(1)}>
            <T zh={<>开机之后，<br />开玩之前。</>} en={<>After boot,<br />before play.</>} />
          </h1>
          <p className="mt-5 max-w-[34ch] animate-rise text-lg leading-[1.8] text-ink-2" style={rise(2)}>
            <T
              zh={`游戏打不开？多半是缺运行库。扫一遍就知道缺什么，点一下从微软和官方渠道自动装齐。${count} 项检测，免安装。`}
              en={`Game won’t start? It’s usually a missing runtime. Scan to see what’s missing, then install it all from Microsoft and official sources in one click. ${count} checks, no install needed.`}
            />
          </p>

          <div className="mt-8 flex animate-rise flex-wrap items-center gap-3" style={rise(3)}>
            {KIT.asset && (
              <a href={KIT.asset.url} className="inline-flex h-12 items-center gap-2.5 rounded-sm bg-ink px-6 text-base font-medium text-paper shadow-[0_24px_40px_-20px_rgba(0,0,0,0.6)] transition-colors hover:bg-ink/85">
                <Download aria-hidden className="size-4" />
                <T zh={`下载 v${KIT.version}`} en={`Download v${KIT.version}`} />
                <span className="tabular text-sm text-paper/60">{KIT.asset.sizeMb} MB</span>
              </a>
            )}
            <a href={KIT.repo} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-sm border border-ink/25 px-5 text-base text-ink transition-colors hover:border-ink hover:bg-ink/[0.04]">
              <GithubMark className="size-4" />
              <T zh="源码" en="Source" />
              <span className="sr-only"><T zh="（在新窗口打开）" en="(opens in a new window)" /></span>
            </a>
          </div>
          <p className="mt-4 animate-rise tabular text-xs leading-[1.9] text-ink-3" style={rise(4)}>
            Windows 10 / 11 · x64 · <T zh="免安装 zip" en="portable zip" /> · <T zh="发布于" en="released" /> {kitDate(KIT.publishedAt)}
          </p>
        </div>

        {shot && (
          <div className="animate-rise lg:col-span-7" style={rise(2)}>
            <figure className="relative">
              <div className="overflow-hidden rounded-md bg-[#FBFBFD] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.08)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBase(shot.src)} width={shot.width} height={shot.height} alt="" className="block h-auto w-full" fetchPriority="high" />
              </div>
              <figcaption className="mt-3 text-right text-xs text-ink-3"><T zh="工具真实界面 · 待机" en="Actual app screen · idle" /></figcaption>
            </figure>
          </div>
        )}

        <a href="#features" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.04em] text-ink-3 transition-colors hover:text-ink lg:flex">
          <ArrowDown aria-hidden className="size-4" />
        </a>
      </div>
    </section>
  );
}
