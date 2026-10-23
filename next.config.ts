import type { NextConfig } from 'next';
import { loadSiteConfig } from './src/lib/config.mjs';

// URL 单源：site/base 全部来自 config/site.json（loadSiteConfig 含校验，坏配置在此即失败）
const site = loadSiteConfig();

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // GitHub Pages 备用：site.json 的 base 注入 basePath（CF 根路径时为 '/'）
  basePath: site.base === '/' ? '' : site.base.replace(/\/$/, ''),
  images: { unoptimized: true }, // 静态导出；Steam CDN 外链图不走优化器
  env: {
    NEXT_PUBLIC_SITE_URL: site.url.replace(/\/$/, ''),
    NEXT_PUBLIC_BASE_PATH: site.base === '/' ? '' : site.base.replace(/\/$/, ''),
  },
};

export default nextConfig;
