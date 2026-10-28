// 装机工具（wanji-kit，github.com/ZYY817/wanji-kit）的最新发布信息：
//   · GitHub Releases：版本号、发布日期、下载包地址与大小、下载次数
//   · catalog/runtimes.json：工具实际检测的组件清单（名称、分类、为什么需要、体积）
//   · docs/screenshots：界面截图，转成 webp 存到 public/kit/（站内自托管，不依赖 GitHub 图床）
// 写入 data/auto/kit.json，装机页（/kit/）和首页装机章读取它。发新版本后无需改网站代码。
//
// 用法：node scripts/sync/kit-release.mjs
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { AUTO, ROOT, getJson, today } from './lib.mjs';

const REPO = 'ZYY817/wanji-kit';
const RAW = `https://raw.githubusercontent.com/${REPO}`;
const SHOTS = ['result', 'components', 'install', 'idle'];
const OUT = join(AUTO, 'kit.json');

// GitHub API 未登录每小时只有 60 次额度：有令牌就带上（Actions 里是自带的 GITHUB_TOKEN，本地可用 GH_TOKEN=$(gh auth token)）
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const gh = async (path) => {
  try {
    const r = await fetch(`https://api.github.com${path}`, { headers: { 'user-agent': 'wanji-index-sync', accept: 'application/vnd.github+json', ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}) } });
    return r.ok ? r.json() : null;
  } catch { return null; }
};
const rel = await gh(`/repos/${REPO}/releases/latest`);
if (!rel?.tag_name) { console.log('GitHub Releases 暂时不可用，本次跳过（不影响已有数据）'); process.exit(0); }
const asset = (rel.assets ?? []).find((a) => /windows.*\.zip$/i.test(a.name)) ?? rel.assets?.[0];
const branch = (await gh(`/repos/${REPO}`))?.default_branch ?? 'master';
const catalog = await getJson(`${RAW}/${branch}/catalog/runtimes.json`);

// 截图：下载 → 近无损 webp（原分辨率，最宽 2560）
const shotDir = join(ROOT, 'public', 'kit');
mkdirSync(shotDir, { recursive: true });
const shots = [];
for (const name of SHOTS) {
  try {
    const r = await fetch(`${RAW}/${branch}/docs/screenshots/${name}.png`);
    if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    // 界面截图里有小字：用近无损 webp（有损压缩会把字压糊）；保留原分辨率，仓库里放 2x 截图时上限 2560 宽
    const meta = await sharp(buf).metadata();
    const w = Math.min(meta.width ?? 2560, 2560);
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ nearLossless: true, quality: 60 }).toFile(join(shotDir, `${name}.webp`));
    shots.push({ name, src: `/kit/${name}.webp`, width: w, height: Math.round((meta.height ?? 1440) * (w / (meta.width ?? w))) });
  } catch (e) { console.log(`  截图 ${name} 获取失败：${e.message}`); }
}

const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
const kit = {
  repo: `https://github.com/${REPO}`,
  version: rel.tag_name.replace(/^v/, ''),
  title: rel.name,
  publishedAt: rel.published_at,
  releaseUrl: rel.html_url,
  asset: asset ? { name: asset.name, url: asset.browser_download_url, sizeMb: Math.round((asset.size / 1048576) * 10) / 10, downloads: asset.download_count } : null,
  catalog: catalog ? {
    version: catalog.version, updatedAt: catalog.updatedAt,
    components: catalog.components.map((c) => ({ id: c.id, name: c.name, short: c.short, category: c.category, importance: c.importance, why: c.why, sizeMb: c.sizeMb })),
  } : old?.catalog ?? null,
  shots: shots.length ? shots : old?.shots ?? [],
  checkedAt: today(),
};
// 下载次数每天都在变，不为它单独产生提交：其他字段没变就保留旧的次数
if (old && JSON.stringify({ ...old, checkedAt: '', asset: { ...old.asset, downloads: 0 } }) === JSON.stringify({ ...kit, checkedAt: '', asset: { ...kit.asset, downloads: 0 } })) {
  console.log(`装机工具：v${kit.version} 无变化`);
} else {
  writeFileSync(OUT, JSON.stringify(kit, null, 2) + '\n');
  console.log(`装机工具：v${kit.version}，${kit.catalog?.components.length ?? 0} 个组件，${kit.shots.length} 张截图`);
}
