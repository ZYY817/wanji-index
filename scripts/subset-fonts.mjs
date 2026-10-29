// 黑体（Noto Sans SC Variable，即思源黑体）子集化：只保留网站实际会显示的字。
//
// 原理：fontsource 把整套字体切成 101 个分片（按 unicode-range），浏览器按页面用到的字去下载分片。
// 一个分片里有几百个字，网站只用到其中一小部分——这里把每个分片裁到「网站用到的字」，
// 没用到字的分片直接不生成，再按裁剪后的实际字表写 unicode-range。字形、粗细轴完全不变。
//
// 用法：npm run fonts        （需要本机 Python + fonttools + brotli：pip install fonttools brotli）
// 新增内容（游戏、教程……）出现新字时重新运行一次；构建时 check-fonts 会提示未覆盖的字。
// 产物提交进仓库：src/fonts/sans/*.woff2、src/fonts/sans.css、src/fonts/sans-chars.txt
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectChars } from './font-chars.mjs';

const PKG = 'node_modules/@fontsource-variable/noto-sans-sc';
const OUT_DIR = 'src/fonts/sans';
const used = collectChars();

const css = readFileSync(join(PKG, 'wght.css'), 'utf8');
const blocks = [...css.matchAll(/src: url\(\.\/files\/([^)]+)\)[^;]*;\s*unicode-range: ([^;]+);/g)].map((m) => ({ file: m[1], range: m[2] }));

/** 「U+4e00-4e05,U+4e08」→ 码点集合 */
function parseRange(r) {
  const set = new Set();
  for (const part of r.split(',')) {
    const [a, b] = part.trim().replace(/^U\+/i, '').split('-').map((h) => parseInt(h, 16));
    for (let c = a; c <= (b ?? a); c++) set.add(c);
  }
  return set;
}
/** 码点数组 → 紧凑的 unicode-range 字符串 */
function toRange(cps) {
  const s = [...cps].sort((x, y) => x - y);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    let j = i;
    while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
    out.push(i === j ? `U+${s[i].toString(16)}` : `U+${s[i].toString(16)}-${s[j].toString(16)}`);
    i = j;
  }
  return out.join(',');
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

let before = 0, after = 0, kept = 0;
const faces = [];
const covered = new Set();
for (const { file, range } of blocks) {
  const src = join(PKG, 'files', file);
  before += statSync(src).size;
  const hit = [...parseRange(range)].filter((c) => used.has(c));
  if (!hit.length) continue;
  const name = file.replace('noto-sans-sc-', 'sans-').replace('-wght-normal', '');
  const out = join(OUT_DIR, name);
  execFileSync('python', ['-m', 'fontTools.subset', src, `--unicodes=${hit.map((c) => c.toString(16)).join(',')}`,
    '--flavor=woff2', `--output-file=${out}`, '--layout-features=*', '--no-hinting'], { stdio: 'inherit' });
  after += statSync(out).size;
  kept++;
  hit.forEach((c) => covered.add(c));
  faces.push(`@font-face {\n  font-family: 'Noto Sans SC Variable';\n  font-style: normal;\n  font-display: swap;\n  font-weight: 100 900;\n  src: url(./sans/${name}) format('woff2-variations');\n  unicode-range: ${toRange(hit)};\n}`);
}

writeFileSync('src/fonts/sans.css', `/* 由 scripts/subset-fonts.mjs 生成，勿手改。来源：@fontsource-variable/noto-sans-sc（已裁剪为网站用到的 ${covered.size} 个字符） */\n\n${faces.join('\n\n')}\n`);
writeFileSync('src/fonts/sans-chars.txt', String.fromCodePoint(...[...covered].sort((a, b) => a - b)));
const kb = (n) => `${Math.round(n / 1024)}KB`;
console.log(`黑体子集：用到 ${used.size} 个字符，覆盖 ${covered.size} 个；分片 ${blocks.length} → ${kept}；总大小 ${kb(before)} → ${kb(after)}`);
if (readdirSync(OUT_DIR).length !== kept) throw new Error('分片数量不一致');
