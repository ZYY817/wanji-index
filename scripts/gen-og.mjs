// 生成分享卡片图 public/og.jpg（1200×630）：微信 / QQ / 微博 / Discord 等转发链接时显示的预览图。
// 版式（与网站同一套「中性黑 + 美术环境光」）：左侧品牌图形、名称、一句话与收录数字；右侧三张倾斜的游戏海报，
// 背后铺一层海报的模糊色光。图形取自 src/lib/brand.mjs，字体用网站自己的思源黑体子集。
// 用法：npm run og（需要本机 Chrome 与网络——海报取自 Steam；产物提交进仓库）
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadData, steamArt } from '../src/lib/data.mjs';
import { STANDARD, VIEWBOX } from '../src/lib/brand.mjs';

const d = loadData();
const pick = ['black-myth-wukong', 'stardew-valley', 'elden-ring'].map((id) => steamArt(d.games.find((g) => g.id === id))?.poster).filter(Boolean);
const css = pathToFileURL(resolve('src/fonts/sans.css')).href;
const mark = `<svg class="mark" viewBox="${VIEWBOX}" fill="#F5F5F7">${STANDARD.map((p) => `<path d="${p}"/>`).join('')}</svg>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${css}">
<style>
  body{margin:0;width:1200px;height:630px;overflow:hidden;background:#000;font-family:'Noto Sans SC Variable',system-ui,sans-serif;color:#F5F5F7;position:relative}
  .glow{position:absolute;right:-120px;top:-120px;width:900px;height:900px;background-size:cover;background-position:center;filter:blur(90px) saturate(1.5);opacity:.55}
  .left{position:absolute;left:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:600px}
  .brand{display:flex;align-items:center;gap:22px}
  .mark{width:72px;height:72px}
  h1{margin:0;font-size:84px;font-weight:650;letter-spacing:-.03em;line-height:1}
  p{margin:36px 0 0;font-size:40px;font-weight:600;letter-spacing:-.015em;line-height:1.3}
  p span{color:#86868B}
  .stats{margin-top:34px;font-size:24px;color:#A1A1A6}
  .stats b{color:#F5F5F7;font-weight:600}
  .wall{position:absolute;right:-30px;top:30px;display:flex;align-items:flex-start;gap:22px;transform:rotate(-8deg)}
  .wall img{width:200px;height:300px;object-fit:cover;border-radius:16px;box-shadow:0 30px 60px -20px rgba(0,0,0,.9),inset 0 0 0 1px rgba(255,255,255,.08)}
  .wall img:nth-child(2){margin-top:70px;width:230px;height:345px}
  .wall img:nth-child(3){margin-top:30px}
  .fade{position:absolute;inset:0;background:linear-gradient(90deg,#000 0%,#000 42%,rgba(0,0,0,.55) 60%,rgba(0,0,0,.1) 82%,rgba(0,0,0,0) 100%)}
</style></head><body>
<div class="glow" style="background-image:url('${pick[1] ?? pick[0]}')"></div>
<div class="wall">${pick.map((u) => `<img src="${u}">`).join('')}</div>
<div class="fade"></div>
<div class="left">
  <div class="brand">${mark}<h1>玩机索引</h1></div>
  <p>PC 游戏资源，一处收齐。<br><span>免费游戏，每天自动更新。</span></p>
  <div class="stats"><b>${d.games.length}</b> 款游戏 · <b>${d.sites.length}</b> 个资源站 · <b>${d.offers.length}</b> 条免费情报</div>
</div>
</body></html>`;

const b = await puppeteer.launch({ executablePath: process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'], userDataDir: (process.env.TEMP ?? '/tmp') + '/pp-og-gen' });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630 });
await p.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 88 });
await b.close();
console.log('✓ public/og.jpg');
