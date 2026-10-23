import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MotionRoot } from '@/components/motion';
import site from '../../config/site.json';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: '面向中文 PC 玩家的游戏资源与工具索引：游戏档案、免费情报、MOD/汉化资源站、实用工具与报错排查。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <MotionRoot>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </MotionRoot>
      </body>
    </html>
  );
}
