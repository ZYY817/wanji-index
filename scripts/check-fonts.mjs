// 构建前检查：内容里出现了宋体子集还没覆盖的字时给出提示（不阻断构建——未覆盖的字会回退到系统宋体显示）。
// 看到提示后在本机运行 npm run fonts 重新生成子集即可。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectChars } from './font-chars.mjs';

const covered = new Set([...readFileSync('src/fonts/serif-chars.txt', 'utf8')].map((c) => c.codePointAt(0)));
// 只关心原字体本来就有的字（emoji、制表符等字体里没有的字不算缺失）
const css = readFileSync(join('node_modules/@fontsource-variable/noto-serif-sc', 'wght.css'), 'utf8');
const inFont = new Set();
for (const m of css.matchAll(/unicode-range: ([^;]+);/g))
  for (const part of m[1].split(',')) {
    const [a, b] = part.trim().replace(/^U\+/i, '').split('-').map((h) => parseInt(h, 16));
    for (let c = a; c <= (b ?? a); c++) inFont.add(c);
  }
const missing = [...collectChars()].filter((c) => inFont.has(c) && !covered.has(c));
if (missing.length) {
  console.warn(`⚠ 宋体子集缺少 ${missing.length} 个字：${String.fromCodePoint(...missing.slice(0, 40))}${missing.length > 40 ? '…' : ''}`);
  console.warn('  这些字会用系统宋体显示。在本机运行 npm run fonts 重新生成子集后提交。');
} else {
  console.log(`✓ 宋体子集覆盖全部 ${covered.size} 个用到的字符`);
}
