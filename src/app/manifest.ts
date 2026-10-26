import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/present';
import { withBase } from '@/lib/base';

export const dynamic = 'force-static';

// 安卓 / 桌面浏览器「添加到主屏幕」用的应用清单
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: 'PC 游戏资源，一处收齐。全部免费。',
    start_url: withBase('/'),
    display: 'standalone',
    background_color: '#131211',
    theme_color: '#131211',
    lang: 'zh-CN',
    icons: [
      { src: withBase('/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: withBase('/icon-512.png'), sizes: '512x512', type: 'image/png' },
      { src: withBase('/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
