// 截图自查：puppeteer-core 连接本机 Chrome，按多个滚动位置截图到 .shots/
// 用法：node scripts/shots.mjs [路径...] [--mobile] [--desktop] [--steps=0,0.5,1,2] [--full] [--base=http://localhost:4321] [--tag=xxx]
//   默认：桌面 1440×900 + 移动 390×844，滚动位置从 0 开始每 0.75 屏一张直到页底（最多 16 张）
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}`));
const val = (k, d) => (flag(k)?.split('=')[1] ?? d);
const BASE = val('base', 'http://localhost:4321');
const TAG = val('tag', '');
// Git Bash 会把 "/games/" 改写成 Windows 路径：也接受不带前导斜杠的写法（home = 首页）
const paths = args.filter((a) => !a.startsWith('--')).map((a) => (/^[A-Za-z]:/.test(a) || a === 'home' ? '/' : a.startsWith('/') ? a : `/${a}`));
if (!paths.length) paths.push('/');
const only = flag('mobile') ? ['mobile'] : flag('desktop') ? ['desktop'] : ['desktop', 'mobile'];
const fixedSteps = flag('steps') ? val('steps').split(',').map(Number) : null;
const OUT = join(process.cwd(), '.shots');
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--disable-gpu'] });
try {
  for (const p of paths) {
    for (const vpName of only) {
      const page = await browser.newPage();
      await page.setViewport(VIEWPORTS[vpName]);
      if (vpName === 'mobile') await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(BASE + p, { waitUntil: 'networkidle2', timeout: 90000 });
      await sleep(1500);
      const name = (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[/?=&]/g, '_')) + (TAG ? `-${TAG}` : '');
      if (flag('full')) {
        await page.screenshot({ path: join(OUT, `${name}-${vpName}-full.png`), fullPage: true });
      } else {
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        const vh = VIEWPORTS[vpName].height;
        const steps = fixedSteps ?? Array.from({ length: Math.min(16, Math.ceil((total - vh) / (vh * 0.75)) + 1) }, (_, i) => i * 0.75);
        for (const s of steps) {
          const y = Math.min(Math.round(s * vh), total - vh);
          // 逐步滚动，让滚动驱动的动效按真实路径推进
          await page.evaluate(async (target) => {
            const start = window.scrollY, n = 12;
            for (let i = 1; i <= n; i++) { window.scrollTo(0, start + ((target - start) * i) / n); await new Promise((r) => setTimeout(r, 40)); }
          }, y);
          await sleep(1100);
          const file = join(OUT, `${name}-${vpName}-${String(s).replace('.', '_')}.png`);
          await page.screenshot({ path: file });
          console.log('✓', file);
        }
      }
      if (errors.length) console.log(`  [${vpName}] 页面错误：\n  - ` + [...new Set(errors)].slice(0, 8).join('\n  - '));
      await page.close();
    }
  }
} finally {
  await browser.close();
}
