// 同步脚本共用的小工具：请求（限速、重试）、读写 data/auto、日期、文本清理。
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const ROOT = process.cwd();
export const AUTO = join(ROOT, 'data', 'auto');
export const today = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10); // 北京时间日期
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const config = () => JSON.parse(readFileSync(join(ROOT, 'config', 'sync.json'), 'utf8'));

const UA = 'wanji-index-sync/1.0 (+https://wanji-index.pages.dev; non-commercial game index)';

/** GET JSON：超时 20 秒；429 / 5xx 退避重试最多 3 次 */
export async function getJson(url, { tries = 3 } = {}) {
  for (let i = 0; i < tries; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: ctrl.signal });
      if (r.status === 429 || r.status >= 500) { await sleep(5000 * (i + 1)); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch { await sleep(2000 * (i + 1)); }
    finally { clearTimeout(t); }
  }
  return null;
}

/** 读某个自动集合的全部记录：Map<id, record> */
export function readAuto(coll) {
  const dir = join(AUTO, coll);
  const out = new Map();
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) if (f.endsWith('.json')) {
    const rec = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    out.set(rec.id, rec);
  }
  return out;
}

/** 读人工数据集合 */
export function readHand(coll) {
  const dir = join(ROOT, 'data', coll);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
}

/** 写自动记录：内容没变（忽略同步时间戳）就不写，避免每天产生无意义的提交 */
export function writeAuto(coll, rec) {
  const dir = join(AUTO, coll);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${rec.id}.json`);
  const strip = (r) => JSON.stringify({ ...r, checkedAt: '', updatedAt: '', _auto: { ...(r._auto ?? {}), syncedAt: '' } });
  if (existsSync(file)) {
    const old = JSON.parse(readFileSync(file, 'utf8'));
    if (strip(old) === strip(rec)) return false;
    rec.createdAt = old.createdAt ?? rec.createdAt;
  }
  writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
  return true;
}

/** HTML → 纯文本 */
export function text(html = '') {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

/** 英文名 → slug */
export const slugify = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/['’™®©]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
