// 由品牌图形（src/lib/brand.mjs）生成全部图标：public/favicon.svg 与各尺寸 PNG（浏览器标签、iPhone 主屏幕、安卓 / PWA）。
// 按尺寸用不同版本——16px 用小尺寸版（菱形更小、缝更宽，不会糊成字母 H），32px 起用标准版。
// 用法：npm run icons（产物提交进仓库）
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { iconSvg, STANDARD, SMALL } from '../src/lib/brand.mjs';

const BG = '#000000', FG = '#F5F5F7';

// 浏览器标签用的矢量图标：标签里实际只有 16–32px，用小尺寸版
writeFileSync('public/favicon.svg', iconSvg({ paths: SMALL, bg: BG, fg: FG, pad: 0.1, size: 64 }) + '\n');

const SIZES = [
  // [文件名, 尺寸, 图形版本, 留白, 圆角]
  ['icon-16.png', 16, SMALL, 0.08, 0.2],
  ['icon-32.png', 32, STANDARD, 0.12, 0.22],
  ['apple-touch-icon.png', 180, STANDARD, 0.2, 0], // iOS 自己会裁圆角，这里给满底
  ['icon-192.png', 192, STANDARD, 0.2, 0.225],
  ['icon-512.png', 512, STANDARD, 0.2, 0.225],
  ['icon-maskable-512.png', 512, STANDARD, 0.28, 0], // 安卓自适应图标会裁成圆形 / 圆角：留更大安全边、满底
];
for (const [name, size, paths, pad, radius] of SIZES) {
  await sharp(Buffer.from(iconSvg({ paths, bg: BG, fg: FG, pad, radius, size }))).png().toFile(`public/${name}`);
  console.log('✓', name);
}
console.log('✓ favicon.svg');
