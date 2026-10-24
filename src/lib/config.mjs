// 站点配置唯一加载入口（docs/06 §4/§8.2 单源原则）。
// 仅限 Node 侧使用：astro.config.mjs（构建入口校验）与 scripts/（校验脚本）。
// .astro/.js 组件内请直接 `import cfg from '.../config/site.json'`（Vite 打包为数据），
// 勿使用本文件——它经打包后文件路径不再指向项目根。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// 项目根=进程工作目录（npm scripts / next build / next dev 均以项目根为 cwd）
export const PROJECT_ROOT = process.cwd();
const ROOT = PROJECT_ROOT + '/';

function readJson(rel, label) {
  const path = `${ROOT}${rel}`;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(`[config] ${label} 解析失败（${rel}）：${e.message}`);
  }
}

export function loadSiteConfig() {
  const cfg = readJson('config/site.json', 'site.json');
  const err = (m) => { throw new Error(`[config] site.json 校验失败：${m}`); };
  if (!cfg.name || typeof cfg.name !== 'string') err('缺少站点名 name');
  if (!cfg.url || !/^https?:\/\//.test(cfg.url)) err('url 必须是合法 http(s) 地址');
  const base = cfg.base ?? '/';
  if (!base.startsWith('/') || !base.endsWith('/')) err('base 必须以 / 开头和结尾');
  const sd = cfg.review?.staleDays;
  for (const k of ['offerTimed', 'offerLong', 'entity', 'guide'])
    if (!Number.isInteger(sd?.[k]) || sd[k] <= 0) err(`review.staleDays.${k} 必须是正整数（docs/04 §4.10）`);
  const fb = cfg.feedback;
  if (fb != null && typeof fb !== 'object') err('feedback 必须是对象');
  if (fb?.issueUrl && !/^https?:\/\//.test(fb.issueUrl)) err('feedback.issueUrl 必须是合法 http(s) 地址');
  if (fb?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fb.email)) err('feedback.email 格式不合法');
  return { ...cfg, base, staleDays: sd };
}

export function loadEnums() {
  return readJson('config/enums.json', 'enums.json');
}

export function loadRedirects() {
  const map = readJson('config/redirects.json', 'redirects.json');
  if (typeof map !== 'object' || map === null || Array.isArray(map))
    throw new Error('[config] redirects.json 必须是 {oldPath: newPath} 对象');
  return map;
}

export const DATA_DIR = process.env.DATA_DIR || 'data';
