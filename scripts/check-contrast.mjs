// Token 对比度核验（WCAG 相对亮度公式）——05 §11 的"实机核验"前置：先保证代码值与规范值零漂移
// 实机渲染测量仍属 M6 人工项（本脚本替代不了 devtools 的 rendered 测量，如实标注）
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROJECT_ROOT } from '../src/lib/config.mjs';

const css = readFileSync(join(PROJECT_ROOT, 'src/styles/tokens.css'), 'utf8');
const tok = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

// [文字, 背景, 要求, 标签] —— 与 05 §3.1/§11 口径一致
const CASES = [
  ['text-primary', 'bg-base', 4.5, '正文/bg-base'],
  ['text-secondary', 'bg-base', 4.5, '次要/bg-base'],
  ['text-tertiary', 'bg-base', 4.5, 'tertiary/bg-base'],
  ['text-tertiary', 'bg-raised', 4.5, 'tertiary/raised'],
  ['text-tertiary', 'bg-sunken', 4.5, 'tertiary/sunken'],
  ['text-tertiary', 'accent-soft', 4.5, 'tertiary/accent-soft'],
  ['#FFFFFF', 'success', 4.5, '白字/success徽标'],
  ['#FFFFFF', 'warning', 4.5, '白字/warning徽标'],
  ['#FFFFFF', 'danger', 4.5, '白字/danger徽标'],
  ['#FFFFFF', 'info', 4.5, '白字/info徽标'],
  ['#FFFFFF', 'neutral-badge', 4.5, '白字/neutral徽标'],
  ['#FFFFFF', 'accent', 4.5, '白字/accent按钮'],
  ['border-control', 'bg-base', 3.0, '控件边/bg-base'],
  ['border-control', 'bg-raised', 3.0, '控件边/raised'],
  ['border-control', 'bg-sunken', 3.0, '控件边/sunken'],
];

let pass = 0, fail = 0;
for (const [fg, bg, min, label] of CASES) {
  const f = tok[fg] ?? fg, b = tok[bg] ?? bg;
  if (!f || !b) { console.log(`✗ ${label}：token 缺失`); fail++; continue; }
  const r = ratio(f, b);
  const ok = r >= min;
  ok ? pass++ : fail++;
  console.log(`${ok ? '✓' : '✗'} ${label} = ${r.toFixed(2)}:1（要求 ≥${min}）`);
}
console.log(`\n对比度公式核验：${pass} 通过 / ${fail} 失败`);
console.log('注：此为 Token 公式计算值核验；rendered 实测（抗锯齿/缩放/深色模式影响）仍列 M6 人工项。');
process.exit(fail ? 1 : 0);
