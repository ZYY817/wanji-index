// 外链巡检：把数据里所有外链实际请求一遍，找出失效 / 可疑的链接。
//
// 用法：
//   npm run check:links            只检查，生成报告 reports/link-check.md
//   npm run check:links -- --write 同时把结果写回数据里的 linkHealth（ok / suspect / dead）
//
// 判定（保守，宁可多一条「需人工确认」，也不误判失效）：
//   两次请求都得到 2xx / 3xx           → ok
//   两次都是 404 / 410                 → dead（已失效）
//   401 / 403 / 429                    → blocked（对方有反爬保护，拒绝一切脚本访问；无法自动判断，保持原状态不改）
//   5xx / 超时 / 网络错误               → suspect（可疑：需人工点开确认）
// 只改 linkHealth，不改 checkedAt——「核验」指人工确认过内容，脚本只负责可达性。
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const WRITE = process.argv.includes('--write');
const DATA = 'data';
const CONCURRENCY = 6;
const TIMEOUT = 15000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name.startsWith('_')) continue; // _examples 等示例不检查
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.json')) out.push(p);
  }
  return out;
}

/** 收集所有外链：带 url / officialUrl 的对象；同一个对象上的 linkHealth 一并记下（写回时用） */
function collect() {
  const links = [];
  const files = new Map();
  for (const file of walk(DATA)) {
    const raw = readFileSync(file, 'utf8');
    const json = JSON.parse(raw);
    files.set(file, { raw, json });
    const visit = (node, path) => {
      if (Array.isArray(node)) return node.forEach((v, i) => visit(v, `${path}[${i}]`));
      if (!node || typeof node !== 'object') return;
      for (const key of ['url', 'officialUrl']) {
        const u = node[key];
        if (typeof u === 'string' && /^https?:\/\//.test(u)) links.push({ file, path: `${path}.${key}`, url: u, node, hasHealth: 'linkHealth' in node, label: node.name ?? node.title ?? node.gameTitle ?? '' });
      }
      for (const [k, v] of Object.entries(node)) if (typeof v === 'object') visit(v, `${path}.${k}`);
    };
    visit(json, '$');
  }
  return { links, files };
}

async function probe(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': UA, accept: 'text/html,*/*', 'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8' } });
    res.body?.cancel().catch(() => {});
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: 0, error: e.name === 'AbortError' ? '超时' : (e.cause?.code ?? e.message) };
  } finally {
    clearTimeout(t);
  }
}

const verdictOf = (r) => (r.status >= 200 && r.status < 400 ? 'ok' : r.status === 404 || r.status === 410 ? 'dead' : [401, 403, 429].includes(r.status) ? 'blocked' : 'suspect');

async function check(url) {
  const a = await probe(url);
  if (verdictOf(a) === 'ok') return { verdict: 'ok', ...a };
  await new Promise((r) => setTimeout(r, 1500));
  const b = await probe(url);
  const va = verdictOf(a), vb = verdictOf(b);
  return { verdict: vb === 'ok' ? 'ok' : va === 'dead' && vb === 'dead' ? 'dead' : vb === 'blocked' ? 'blocked' : 'suspect', ...b, first: a };
}

const { links, files } = collect();
const unique = [...new Set(links.map((l) => l.url))];
console.log(`共 ${links.length} 处外链（去重后 ${unique.length} 个地址），开始检查……`);
const results = new Map();
let done = 0;
async function worker(queue) {
  for (let u = queue.shift(); u; u = queue.shift()) {
    results.set(u, await check(u));
    if (++done % 20 === 0) console.log(`  ${done}/${unique.length}`);
  }
}
const queue = [...unique];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

// 报告
const rows = links.map((l) => ({ ...l, r: results.get(l.url) }));
const bad = rows.filter((x) => x.r.verdict === 'dead' || x.r.verdict === 'suspect');
const blockedHosts = [...new Set(rows.filter((x) => x.r.verdict === 'blocked').map((x) => new URL(x.url).hostname))];
const count = (v) => rows.filter((x) => x.r.verdict === v).length;
const why = (r) => (r.status ? `HTTP ${r.status}` : r.error);
const today = new Date().toISOString().slice(0, 10);
const md = [
  `# 外链巡检报告（${today}）`,
  '',
  `共 ${rows.length} 处：正常 ${count('ok')}，可疑 ${count('suspect')}，失效 ${count('dead')}；另有 ${count('blocked')} 处所在站点拒绝脚本访问、无法自动检查（${blockedHosts.join('、') || '无'}），保持原状态。`,
  '',
  bad.length ? '| 状态 | 名称 | 原因 | 文件 | 地址 |\n|---|---|---|---|---|\n' + bad.sort((a, b) => (a.r.verdict === 'dead' ? -1 : 1) - (b.r.verdict === 'dead' ? -1 : 1))
    .map((x) => `| ${x.r.verdict === 'dead' ? '**失效**' : '可疑'} | ${x.label} | ${why(x.r)} | ${relative('.', x.file).replace(/\\/g, '/')} | ${x.url} |`).join('\n') : '全部正常。',
  '',
  '「可疑」多为网络超时或对方服务器暂时出错，请在浏览器里点开确认；确认正常后无需处理。',
].join('\n');
mkdirSync('reports', { recursive: true });
writeFileSync('reports/link-check.md', md + '\n');
console.log(`\n正常 ${count('ok')} · 可疑 ${count('suspect')} · 失效 ${count('dead')} · 无法自动检查 ${count('blocked')}（${blockedHosts.join('、')}）　→ 报告：reports/link-check.md`);

// 写回 linkHealth（只改有变化的文件；保持原文件的换行风格与两格缩进）
if (WRITE) {
  const changed = new Set();
  for (const x of rows) {
    if (!x.hasHealth || x.r.verdict === 'blocked') continue;
    const next = x.r.verdict;
    if (x.node.linkHealth !== next) { x.node.linkHealth = next; changed.add(x.file); }
  }
  for (const file of changed) {
    const { raw, json } = files.get(file);
    const nl = raw.includes('\r\n') ? '\r\n' : '\n';
    writeFileSync(file, JSON.stringify(json, null, 2).replace(/\n/g, nl) + nl);
  }
  console.log(`已写回 ${changed.size} 个数据文件的 linkHealth。`);
}
process.exitCode = count('dead') ? 1 : 0;
