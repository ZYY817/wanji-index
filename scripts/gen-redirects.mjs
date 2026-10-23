// 生成 dist _redirects（Cloudflare Pages 格式）—— 构建后调用
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadRedirects, PROJECT_ROOT } from '../src/lib/config.mjs';

const redirects = loadRedirects();
// 构建入口校验：站内路径/自指/链式
for (const [from, to] of Object.entries(redirects)) {
  if (!to.startsWith('/')) throw new Error(`[redirects] ${from} 目标必须是站内路径：${to}`);
  if (from === to) throw new Error(`[redirects] ${from} 自指`);
  if (redirects[to]) throw new Error(`[redirects] ${from}→${to} 链式重定向`);
}
const body = Object.entries(redirects).map(([f, t]) => `${f} ${t} 301`).join('\n');
writeFileSync(join(PROJECT_ROOT, 'out', '_redirects'), body ? body + '\n' : '');
console.log(`_redirects 生成（${Object.keys(redirects).length} 条）`);
