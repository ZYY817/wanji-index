import Link from 'next/link';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { T } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * 外链与下载安全提示（工具 / 资源站共用）：
 *   本站只做链接整理与分享，不提供文件下载，也不对第三方网站的内容负责。
 *   compact：列表页刊头下的一行说明，链接到关于页的完整说明；
 *   full：详情页的提示框，列出下载前该核对的几件事。
 */
const TIPS: [string, string][] = [
  ['认准本页给出的官方地址：搜索结果里常有名字相似的仿冒站和「高速下载」页面。', 'Use the official address on this page — search results are full of look-alike sites and “fast download” pages.'],
  ['不要点页面上的「下载器」「高速下载」等广告按钮，真正的下载链接通常是不起眼的文字链接。', 'Skip “downloader” and “fast download” ad buttons; the real link is usually a plain text link.'],
  ['安装时留意并取消勾选捆绑的浏览器、安全软件或工具栏。', 'Watch for and untick bundled browsers, “security” apps or toolbars during installation.'],
  ['可执行文件和压缩包先用杀毒软件扫描；联网游戏使用注入类工具前，先确认是否违反游戏规定。', 'Scan executables and archives first; check a game’s rules before using injection tools in online games.'],
];

export function SafetyNote({ variant = 'full', className }: { variant?: 'full' | 'compact'; className?: string }) {
  if (variant === 'compact')
    return (
      <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-3', className)}>
        <ShieldCheck aria-hidden className="size-4 shrink-0" />
        <T zh="本站只整理和分享官方链接，不提供任何文件下载；第三方网站的内容与广告与本站无关，下载前请认准官方地址。" en="We only collect and share official links and host no downloads; third-party sites and their ads are not ours — always check you’re on the official address." />
        <Link href="/about/#safety" className="inline-flex items-center gap-0.5 text-foreground underline-offset-4 hover:underline">
          <T zh="下载安全须知" en="Download safety tips" />
          <ChevronRight aria-hidden className="size-3.5" />
        </Link>
      </p>
    );
  return (
    <div className={cn('rounded-lg bg-white/[0.04] px-6 py-5 ring-1 ring-inset ring-white/[0.08]', className)}>
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <ShieldCheck aria-hidden className="size-4 text-ok" />
        <T zh="下载与访问安全" en="Download & browsing safety" />
      </p>
      <p className="mt-2 text-sm leading-[1.7] text-fg-2">
        <T zh="本站只做链接整理与分享，不提供任何文件下载，也不对第三方网站的内容、广告与软件负责。下载前请核对：" en="We only collect and share links. We host no files and aren’t responsible for third-party sites, their ads or software. Before you download:" />
      </p>
      <ul className="mt-3 space-y-1.5 text-sm leading-[1.7] text-fg-2">
        {TIPS.map(([zh, en]) => (
          <li key={zh} className="flex gap-2"><span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-fg-3" /><T zh={zh} en={en} /></li>
        ))}
      </ul>
    </div>
  );
}

/** 关于页的完整说明用同一份要点 */
export const SAFETY_TIPS = TIPS;
