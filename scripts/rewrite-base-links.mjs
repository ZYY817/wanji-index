// 一次性迁移脚本：把 .astro 中裸写的站内绝对路径改为 withBase()（src/lib/url.mjs）
// 处理：href="/x" / action="/x" / href={`/x/${y}`} / 数组字串 '/x/'（Header NAV 等）
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  statSync(p).isDirectory() ? walk(p) : f.endsWith('.astro') && files.push(p);
});
walk('src');

const imp = (f) => {
  const rel = relative(dirname(f), 'src/lib/url.mjs').replace(/\\/g, '/');
  return `import { withBase } from '${rel.startsWith('.') ? rel : './' + rel}';`;
};

let total = 0;
for (const f of files) {
  let c = readFileSync(f, 'utf8'), n = 0;
  c = c.replace(/href="(\/[^"]*)"/g, (m, p) => { n++; return `href={withBase('${p}')}`; });
  c = c.replace(/action="(\/[^"]*)"/g, (m, p) => { n++; return `action={withBase('${p}')}`; });
  c = c.replace(/href=\{(`[^`]+`)\}/g, (m, t) => { n++; return `href={withBase(${t})}`; });
  // 数组/对象内的 '/x/' 字串（NAV/ENTRY/hot 链接等）
  c = c.replace(/(href:\s*)'(\/[^']*)'/g, (m, k, p) => { n++; return `${k}withBase('${p}')`; });
  if (n) {
    if (!c.includes('url.mjs')) c = c.replace(/^---\n/, `---\n${imp(f)}\n`);
    writeFileSync(f, c);
    total += n;
    console.log(f, n);
  }
}
console.log('replaced:', total);
