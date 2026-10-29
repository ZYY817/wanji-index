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

// V9「中性玻璃」token（src/app/globals.css @theme）
const CASES = [
  // 文字三级 × 画布与抬升层
  ['foreground', 'background', 4.5, '正文/画布'],
  ['fg-2', 'background', 4.5, '次要/画布'],
  ['fg-3', 'background', 4.5, '弱化/画布'],
  ['foreground', 'card', 4.5, '正文/card'],
  ['fg-2', 'card', 4.5, '次要/card'],
  ['fg-3', 'card', 4.5, '弱化/card'],
  ['fg-2', 'surface-2', 4.5, '次要/surface-2'],
  ['fg-3', 'surface-2', 4.5, '弱化/surface-2'],
  ['fg-2', 'popover', 4.5, '次要/浮层'],
  ['foreground', 'shell', 4.5, '正文/终端块'],
  // 主按钮与强调
  ['cta-foreground', 'cta', 4.5, '主按钮字/蓝'],
  ['cta-foreground', 'cta-hover', 4.5, '主按钮字/悬停'],
  ['primary', 'background', 4.5, '强调蓝字/画布（链接、当前态）'],
  ['primary', 'card', 4.5, '强调蓝字/card'],
  ['primary', 'surface-2', 4.5, '强调蓝字/surface-2'],
  ['bad-text', 'background', 4.5, '报错原文红/画布'],
  ['bad-text', 'shell', 4.5, '报错原文红/终端块'],
  // 生命周期徽标（实心）
  ['on-solid', 'ok', 4.5, '进行中徽标'],
  ['on-solid', 'info', 4.5, '预告徽标'],
  ['on-solid', 'ended', 4.5, '已结束徽标'],
  ['on-solid', 'ongoing', 4.5, '长期进行徽标'],
  ['on-solid', 'warn', 4.5, '待确认徽标'],
  // 状态徽标（描边：字色 = 线色，置于画布/card）
  ['warn', 'background', 4.5, '疑似失效/画布'],
  ['bad', 'background', 4.5, '已失效/画布'],
  ['ok', 'background', 4.5, '已验证·亲测/画布'],
  ['info', 'background', 4.5, '社区验证/画布'],
  ['fg-3', 'background', 4.5, '待核验/画布'],
  ['warn', 'card', 4.5, '疑似失效/card'],
  ['bad', 'card', 4.5, '已失效/card'],
  ['ok', 'card', 4.5, '已验证/card'],
  ['info', 'card', 4.5, '社区验证/card'],
  // 纸面反白章
  ['ink', 'paper', 4.5, '纸面正文'],
  ['ink-2', 'paper', 4.5, '纸面次要'],
  ['ink-3', 'paper', 4.5, '纸面弱化'],
  ['ink-3', 'paper-2', 4.5, '纸面弱化/纸面二级'],
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
