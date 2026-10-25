import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Cursor } from '@/components/layout/cursor';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@fontsource-variable/noto-serif-sc/wght.css';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { CommandProvider } from '@/components/layout/command-palette';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { loadData } from '@/lib/data.mjs';
import { buildStamp, SITE } from '@/lib/present';
import { withBase } from '@/lib/base';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — PC 游戏资源与工具索引`, template: `%s · ${SITE.name}` },
  description: '面向中文 PC 玩家的游戏资源与工具索引：游戏档案、免费情报、MOD 与资源站目录、实用工具与报错排查。只指向官方与可信的原始来源。',
  icons: { icon: withBase('/favicon.svg') },
  openGraph: { siteName: SITE.name, locale: 'zh_CN', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#131211', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const data = loadData();
  const counts = { games: data.games.length, free: data.offers.length, sites: data.sites.length, tools: data.tools.length, guides: data.guides.length };
  // suppressHydrationWarning：翻译 / 暗色模式类浏览器插件会改写 <html> 属性，只忽略这一层的差异
  return (
    <html lang="zh-CN" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
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
          跳到正文
        </a>
        <Providers>
          <CommandProvider>
            <SiteHeader counts={counts} />
            <Cursor />
            <div aria-hidden className="film-grain" />
            <main id="main">{children}</main>
            <SiteFooter
              build={buildStamp()}
              stats={[
                { label: '游戏档案', value: counts.games },
                { label: '资源站', value: counts.sites },
                { label: '免费情报', value: counts.free },
                { label: '工具', value: counts.tools },
                { label: '教程', value: counts.guides },
              ]}
            />
          </CommandProvider>
        </Providers>
      </body>
    </html>
  );
}
