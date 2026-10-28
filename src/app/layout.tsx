import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
// 宋体只加载网站用到的字（scripts/subset-fonts.mjs 生成；新增内容出现新字时运行 npm run fonts）
import '../fonts/serif.css';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { CommandProvider } from '@/components/layout/command-palette';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { loadData } from '@/lib/data.mjs';
import { buildStamp, SITE } from '@/lib/present';
import { withBase } from '@/lib/base';
import { LANG_BOOT, t } from '@/lib/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — PC 游戏资源与工具索引`, template: `%s · ${SITE.name}` },
  description: '为 PC 玩家收集的游戏资源与情报站：游戏档案、免费游戏情报、MOD 与资源站目录、实用工具与报错排查，全部免费查阅。',
  icons: {
    icon: [{ url: withBase('/favicon.svg'), type: 'image/svg+xml' }, { url: withBase('/icon-32.png'), sizes: '32x32', type: 'image/png' }],
    apple: withBase('/apple-touch-icon.png'),
  },
  manifest: withBase('/manifest.webmanifest'),
  // 分享卡片：各页面不单独设置时都继承这张（scripts/gen-og.mjs 生成）
  openGraph: { siteName: SITE.name, locale: 'zh_CN', type: 'website', images: [{ url: withBase('/og.jpg'), width: 1200, height: 630, alt: `${SITE.name}——PC 游戏资源，一处收齐` }] },
  twitter: { card: 'summary_large_image', images: [withBase('/og.jpg')] },
};

export const viewport: Viewport = { themeColor: '#131211', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const data = loadData();
  const counts = { games: data.games.length, free: data.offers.length, sites: data.sites.length, tools: data.tools.length, guides: data.problems.length + data.guides.length };
  // suppressHydrationWarning：翻译 / 暗色模式类浏览器插件会改写 <html> 属性，只忽略这一层的差异
  return (
    <html lang="zh-CN" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* 语言：首帧前从 localStorage 恢复，避免先闪中文再切英文 */}
        <Script id="lang-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
        {/* 开场是否播放：在首帧之前决定，避免「先闪开场再消失」。访问过 / reduced-motion → 隐藏开场层；否则首屏入场动画延后到幕布拉开 */}
        <Script
          id="intro-gate"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;if(localStorage.getItem('wanji-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-seen')}else{d.style.setProperty('--intro-delay','1.2s')}}catch(e){document.documentElement.classList.add('intro-seen')}`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <a href="#main" className="sr-only z-[100] bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          {t('跳到正文', 'Skip to content')}
        </a>
        <Providers>
          <CommandProvider>
            <SiteHeader counts={counts} />
            <div aria-hidden className="film-grain" />
            <main id="main">{children}</main>
            <SiteFooter
              build={buildStamp()}
              stats={[
                { key: 'games', label: t('游戏档案', 'Games'), value: counts.games },
                { key: 'sites', label: t('资源站', 'Sites'), value: counts.sites },
                { key: 'free', label: t('免费情报', 'Free offers'), value: counts.free },
                { key: 'tools', label: t('工具', 'Tools'), value: counts.tools },
                { key: 'fixes', label: t('排障与教程', 'Fixes & guides'), value: counts.guides },
              ]}
            />
          </CommandProvider>
        </Providers>
      </body>
    </html>
  );
}
