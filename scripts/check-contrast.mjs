// Token 对比度核验（深色主题版）—— 读 globals.css @theme 的 hex 值算 WCAG 相对亮度
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROJECT_ROOT } from '../src/lib/config.mjs';

const css = readFileSync(join(PROJECT_ROOT, 'src/app/globals.css'), 'utf8');
const tok = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

const CASES = [
  ['txt-1', 'ink-0', 4.5, '正文/底'],
  ['txt-2', 'ink-0', 4.5, '次要/底'],
  ['txt-3', 'ink-0', 4.5, 'tertiary/底'],
  ['txt-1', 'ink-1', 4.5, '正文/卡片'],
  ['txt-2', 'ink-1', 4.5, '次要/卡片'],
  ['txt-3', 'ink-1', 4.5, 'tertiary/卡片'],
  ['#0B0E13', 'amber', 4.5, '黑字/琥珀按钮'],
  ['#0B0E13', 'ok', 4.5, '黑字/ok徽标'],
  ['#0B0E13', 'warn', 4.5, '黑字/warn徽标'],
  ['#0B0E13', 'bad', 4.5, '黑字/bad徽标'],
  ['#0B0E13', 'info', 4.5, '黑字/info徽标'],
  ['amber-hi', 'ink-0', 4.5, '琥珀亮字/底'],
];

let pass = 0, fail = 0;
for (const [fg, bg, min, label] of CASES) {
  const f = tok[fg] ?? fg, b = tok[bg] ?? bg;
  const r = ratio(f, b);
  const ok = r >= min;
  ok ? pass++ : fail++;
  console.log(`${ok ? '✓' : '✗'} ${label} = ${r.toFixed(2)}:1（要求 ≥${min}）`);
}
console.log(`\n对比度公式核验：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
