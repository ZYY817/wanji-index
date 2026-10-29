import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import type { GameDetail } from '@/lib/game-detail';
import { CopyButton } from '@/components/ui/copy-button';
import { OfferFact } from './offer-fact';
import { cn } from '@/lib/utils';

/**
 * 速答条：首屏之下第一眼回答四个最常见问题。
 * V6 规范：
 * - 4 个格子：去哪买 / 现在免不免费 / MOD 与汉化 / 存档位置；
 * - 每格结构统一：标题（小）→ 一行答案 → 一个动作；
 * - 手机端改为 2 列（grid-cols-2），桌面 4 列（lg:grid-cols-4）；
 * - 紧凑控制首屏高度，与 DetailHero 结合不超过一屏；
 * - 所有动作按钮点击区 ≥ 44px。
 */
export function QuickFacts({ d }: { d: GameDetail }) {
  const channel = d.channels[0];
  const entry = d.entries[0];
  const save = d.paths.find((p) => p.kind === '存档') ?? d.paths[0];

  return (
    <section aria-label="Quick facts" className="relative z-10 border-b border-white/[0.08]">
      <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
        {/* 1. 去哪买 */}
        <FactCell title={<T zh="去哪买" en="Where to get it" />} index={0}>
          {channel ? (
            <>
              <p className="truncate text-base font-medium text-foreground">
                {L('platform', channel.platform)} · <T zh={channel.note} en={channel.noteEn} />
              </p>
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-foreground underline decoration-primary underline-offset-4 hover:text-primary"
              >
                <T zh="前往商店" en="Go to store" /> ↗
              </a>
            </>
          ) : (
            <>
              <p className="truncate text-base text-fg-2"><T zh="暂未收录" en="Not listed yet" /></p>
              <span className="mt-2 inline-flex min-h-11 items-center text-sm text-fg-3"><T zh="暂无渠道" en="No stores" /></span>
            </>
          )}
        </FactCell>

        {/* 2. 现在免不免费 */}
        <FactCell title={<T zh="现在免不免费" en="Free right now?" />} index={1}>
          <OfferFact offers={d.offers} />
        </FactCell>

        {/* 3. MOD 与汉化 */}
        <FactCell title={<T zh="MOD 与汉化" en="Mods & translations" />} index={2}>
          {entry ? (
            <>
              <p className="truncate text-base font-medium text-foreground">
                {entry.site?.name ?? entry.name}
              </p>
              <a
                href="#entries"
                className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-foreground underline decoration-primary underline-offset-4 hover:text-primary"
              >
                <T zh="查看专区" en="See all" /> ({d.entries.length}) ↓
              </a>
            </>
          ) : (
            <>
              <p className="truncate text-base text-fg-2"><T zh="暂未收录" en="Not listed yet" /></p>
              <span className="mt-2 inline-flex min-h-11 items-center text-sm text-fg-3"><T zh="暂无资源" en="No resources" /></span>
            </>
          )}
        </FactCell>

        {/* 4. 存档位置 */}
        <FactCell title={<T zh="存档位置" en="Save location" />} index={3}>
          {save ? (
            <>
              <code title={save.path} className="block truncate font-mono text-sm leading-snug text-foreground">
                {save.path}
              </code>
              <div className="mt-2 flex min-h-11 items-center">
                <CopyButton text={save.path} label="复制路径" labelEn="Copy path" className="min-h-11 px-3.5 text-sm" />
              </div>
            </>
          ) : (
            <>
              <p className="truncate text-base text-fg-2"><T zh="暂未收录" en="Not listed yet" /></p>
              <span className="mt-2 inline-flex min-h-11 items-center text-sm text-fg-3"><T zh="暂无路径" en="No paths" /></span>
            </>
          )}
        </FactCell>
      </dl>
    </section>
  );
}

function FactCell({ title, index, children }: { title: React.ReactNode; index: number; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col justify-between py-4 sm:py-5 lg:py-6',
        // 移动端 2 列内边框：奇数列（0, 2）带右边框；前 2 项带底边框
        index % 2 === 0 ? 'pr-4 sm:pr-6 border-r border-border' : 'pl-4 sm:pl-6',
        index < 2 ? 'border-b border-border lg:border-b-0' : '',
        // 桌面 4 列内边框：前 3 项带右边框，居中内边距
        'lg:px-6 lg:[&:first-child]:pl-0 lg:[&:last-child]:pr-0',
        index < 3 ? 'lg:border-r lg:border-border' : 'lg:border-r-0',
      )}
    >
      <dt className="text-sm font-medium text-fg-2">{title}</dt>
      <dd className="mt-2.5 min-w-0">{children}</dd>
    </div>
  );
}
