// 生成分享卡片图 public/og.jpg（1200×630）：微信 / QQ / 微博 / Discord 等转发链接时显示的预览图。
// 版式：左侧字标与一句话 + 收录数字；右侧三张倾斜的游戏海报。字体用网站自己的宋体子集。
// 用法：npm run og（需要本机 Chrome 与网络——海报取自 Steam；产物提交进仓库）
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadData, steamArt } from '../src/lib/data.mjs';

const d = loadData();
const pick = ['black-myth-wukong', 'stardew-valley', 'elden-ring'].map((id) => steamArt(d.games.find((g) => g.id === id))?.poster).filter(Boolean);
const css = pathToFileURL(resolve('src/fonts/serif.css')).href;
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${css}">
<style>
  body{margin:0;width:1200px;height:630px;overflow:hidden;background:#131211;font-family:'Noto Serif SC Variable',serif;color:#EDEBE5;position:relative}
  .glow{position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 78% 50%,rgba(216,182,122,.16),transparent 70%),radial-gradient(ellipse 50% 70% at 10% 0%,rgba(216,182,122,.06),transparent 70%)}
  .left{position:absolute;left:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:560px}
  .mark{width:64px;height:64px}
  h1{margin:28px 0 0;font-size:96px;font-weight:900;letter-spacing:-.045em;line-height:1}
  p{margin:26px 0 0;font-size:34px;font-weight:700;letter-spacing:-.02em;line-height:1.35}
  p span{color:rgba(237,235,229,.45)}
  .stats{margin-top:34px;font-family:system-ui,sans-serif;font-size:22px;color:#A9A69C;letter-spacing:.02em}
  .stats b{color:#D8B67A;font-weight:600}
  .wall{position:absolute;right:-30px;top:20px;display:flex;align-items:flex-start;gap:22px;transform:rotate(-8deg)}
  .wall img{width:200px;height:300px;object-fit:cover;border-radius:6px;box-shadow:0 30px 60px -20px rgba(0,0,0,.9)}
  .wall img:nth-child(2){margin-top:70px;width:230px;height:345px}
  .wall img:nth-child(3){margin-top:30px}
  .fade{position:absolute;inset:0;background:linear-gradient(90deg,#131211 0%,#131211 40%,rgba(19,18,17,.6) 58%,rgba(19,18,17,.15) 80%,rgba(19,18,17,.05) 100%)}
</style></head><body>
<div class="glow"></div>
<div class="wall">${pick.map((u) => `<img src="${u}">`).join('')}</div>
<div class="fade"></div>
<div class="left">
  <svg class="mark" viewBox="0 0 64 64"><g fill="none" stroke="#D8B67A"><circle cx="32" cy="32" r="18" stroke-width="3.6"/><circle cx="32" cy="32" r="10.5" stroke-width="1.8" stroke-opacity=".5"/></g><circle cx="32" cy="32" r="3.8" fill="#EDEBE5"/></svg>
  <h1>玩机索引</h1>
  <p>PC 游戏资源，一处收齐。<br><span>全部免费。</span></p>
  <div class="stats"><b>${d.games.length}</b> 款游戏 · <b>${d.sites.length}</b> 个资源站 · <b>${d.offers.length}</b> 条免费情报</div>
</div>
</body></html>`;

const b = await puppeteer.launch({ executablePath: process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630 });
await p.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 86 });
await b.close();
console.log('✓ public/og.jpg');
