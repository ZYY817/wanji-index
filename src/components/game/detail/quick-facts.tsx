import type { GameDetail } from '@/lib/game-detail';
import { zh } from '@/lib/labels.mjs';
import { CopyButton } from '@/components/ui/copy-button';
import { OfferFact } from './offer-fact';

/**
 * 速答条：首屏之下第一眼就回答四个最常见的问题。每格结构相同——问题（小）→ 答案（大）→ 补充（小）。
 * 答案都来自档案里真实的第一条记录，并链接到对应章节查看全部。
 */
export function QuickFacts({ d }: { d: GameDetail }) {
  const channel = d.channels[0];
  const entry = d.entries[0];
  const save = d.paths.find((p) => p.kind === '存档') ?? d.paths[0];

  return (
    <section aria-label="速答" className="relative z-10 border-y border-border bg-background">
      <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
        <Fact q="去哪买" href={channel ? '#channels' : undefined}>
          {channel ? (
            <>
              <p className="text-lg leading-snug text-foreground">{zh('platform', channel.platform)} · {channel.note}</p>
              <p className="mt-1 text-sm text-fg-3">共 {d.channels.length} 个正版渠道</p>
            </>
          ) : (
            <p className="text-lg text-fg-2">暂未收录</p>
          )}
        </Fact>

        <Fact q="现在免费吗">
          <OfferFact offers={d.offers} />
        </Fact>

        <Fact q="MOD 与汉化" href={entry ? '#entries' : undefined}>
          {entry ? (
            <>
              <p className="text-lg leading-snug text-foreground">{entry.site?.name ?? entry.name}</p>
              <p className="mt-1 text-sm text-fg-3">共 {d.entries.length} 个社区入口</p>
            </>
          ) : (
            <p className="text-lg text-fg-2">暂未收录</p>
          )}
        </Fact>

        <Fact q="存档在哪" href={save ? '#paths' : undefined}>
          {save ? (
            <>
              <code title={save.path} className="block truncate font-mono text-base leading-snug text-foreground">{save.path}</code>
              <CopyButton text={save.path} label="复制路径" className="mt-2" />
            </>
          ) : (
            <p className="text-lg text-fg-2">暂未收录</p>
          )}
        </Fact>
      </dl>
    </section>
  );
}

function Fact({ q, href, children }: { q: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="border-border py-6 pr-6 [&:nth-child(even)]:pl-6 [&:nth-child(odd)]:border-r lg:border-r lg:pl-6 lg:[&:first-child]:pl-0 lg:[&:last-child]:border-r-0">
      <dt className="flex items-center justify-between gap-3 text-sm text-fg-3">
        {q}
        {href && (
          <a href={href} className="text-xs text-fg-3 underline-offset-4 transition-colors hover:text-foreground hover:underline">
            查看全部
          </a>
        )}
      </dt>
      <dd className="mt-3">{children}</dd>
    </div>
  );
}
