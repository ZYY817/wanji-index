// 收集网站可能显示的全部字符：页面代码里的文案 + 数据（游戏、资源站、教程……）+ 站点配置。
// 字体子集化（subset-fonts.mjs）与构建检查（check-fonts.mjs）共用这一份来源，保证口径一致。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'data', 'config'];
const EXT = new Set(['.ts', '.tsx', '.mjs', '.js', '.json', '.md', '.css']);
const SKIP = new Set(['src/fonts']);

function walk(dir, out) {
  if (SKIP.has(dir.replace(/\\/g, '/'))) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.has(extname(name))) out.push(p);
  }
}

/** 返回码点集合：上述文件里出现过的所有非控制字符 + 完整的可打印 ASCII 与常用全角标点 */
export function collectChars() {
  const files = [];
  ROOTS.forEach((r) => walk(r, files));
  const set = new Set();
  for (const f of files) for (const ch of readFileSync(f, 'utf8')) { const c = ch.codePointAt(0); if (c >= 0x20) set.add(c); }
  for (let c = 0x20; c <= 0x7e; c++) set.add(c);
  for (const ch of '，。、！？：；“”‘’（）《》【】—…·「」『』〈〉％＋－／') set.add(ch.codePointAt(0));
  return set;
}
