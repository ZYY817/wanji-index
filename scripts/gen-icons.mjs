// 由 public/favicon.svg 生成各尺寸 PNG 图标（浏览器标签、iPhone 添加到主屏幕、安卓 / PWA）。
// 用法：npm run icons（需要本机 Chrome；产物提交进仓库）
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg', 'utf8');
const SIZES = [
  ['icon-32.png', 32, 0],
  ['apple-touch-icon.png', 180, 0],
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['icon-maskable-512.png', 512, 0.12], // 安卓自适应图标会裁成圆形：四周留 12% 安全边
];
const b = await puppeteer.launch({ executablePath: process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage();
for (const [name, size, pad] of SIZES) {
  await p.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  const inner = Math.round(size * (1 - pad * 2));
  await p.setContent(`<html><body style="margin:0;background:${pad ? '#131211' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await p.screenshot({ path: `public/${name}`, omitBackground: !pad, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('✓', name);
}
await b.close();
