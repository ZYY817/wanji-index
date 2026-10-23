import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadSiteConfig, loadRedirects, PROJECT_ROOT } from './src/lib/config.mjs';
import { isEligible } from './src/lib/eligibility.mjs';

// URL 单源：site/base 全部来自 config/site.json，经 loadSiteConfig 校验（docs/06 §8.2）
const site = loadSiteConfig();
const redirects = loadRedirects();

// 重定向校验（docs/06 产物断言）：目标必须带尾斜杠路径、不得自指/循环
for (const [from, to] of Object.entries(redirects)) {
  if (!to.startsWith('/')) throw new Error(`[redirects] ${from} 目标必须是站内路径：${to}`);
  if (from === to) throw new Error(`[redirects] ${from} 自指`);
  if (redirects[to]) throw new Error(`[redirects] ${from}→${to} 存在重定向链（目标也是源）`);
}

// sitemap lastmod：从 data/ 取各实体 updatedAt（fs 直读，不经 Vite glob）
const DIR_TYPE = { games: 'game', sites: 'site', tools: 'tool', guides: 'guide' };
const PATH_OF = { games: '/games/', sites: '/resources/', tools: '/tools/', guides: '/guides/' };
const lastmodMap = {};
for (const [dir, type] of Object.entries(DIR_TYPE)) {
  const d = join(PROJECT_ROOT, 'data', dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) {
    if (!f.endsWith('.json')) continue;
    try {
      const rec = JSON.parse(readFileSync(join(d, f), 'utf8'));
      if (isEligible(type, rec)) lastmodMap[`${site.url.replace(/\/$/, '')}${PATH_OF[dir]}${rec.slug}/`] = rec.updatedAt;
    } catch { /* 语法错误由 validate 负责 */ }
  }
}

// _redirects 生成（Cloudflare Pages 格式），构建末期写入 dist/
const redirectsPlugin = {
  name: 'wanji-redirects',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const body = Object.entries(redirects).map(([f, t]) => `${f} ${t} 301`).join('\n');
      writeFileSync(new URL('./_redirects', dir), (body ? body + '\n' : '') + '');
    },
  },
};

export default defineConfig({
  site: site.url,
  base: site.base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      // /search/=noindex、404、/design/=M2 验收预览页——均不进 sitemap
      filter: (page) => !page.includes('/search/') && !page.includes('404') && !page.includes('/design/'),
      serialize: (item) => ({ ...item, ...(lastmodMap[item.url] && { lastmod: lastmodMap[item.url] }) }),
    }),
    redirectsPlugin,
  ],
});
