// 构建前分层校验（docs/06 §7）：
//   A. config/*.json 解析+字段校验
//   B. data/**/*.json → Ajv Schema（结构/必填/枚举，枚举值单源 enums.json）
//   C. 自定义业务规则：id/slug 唯一、必填关联存在（阻断）、可选关联悬空（警告）、
//      published 未达最低标准（警告）
// 用法：node scripts/validate.mjs [--data <目录>]（默认 data/；负向测试指向 tests/bad/*）
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadSiteConfig, loadEnums, loadRedirects, PROJECT_ROOT } from '../src/lib/config.mjs';
import { loadSchemas, ENTITY_DIRS } from '../src/lib/schema.mjs';
import { isEligible } from '../src/lib/eligibility.mjs';

const argDir = process.argv[process.argv.indexOf('--data') + 1] || null;
const useCustomDir = process.argv.includes('--data');
const dataDir = join(PROJECT_ROOT, useCustomDir ? argDir : 'data');
const errors = [], warnings = [];

// A. 配置
for (const [fn, loader] of [['site.json', loadSiteConfig], ['enums.json', loadEnums], ['redirects.json', loadRedirects]])
  try { loader(); } catch (e) { errors.push(e.message); }

// B. Schema 校验
let validators = {};
try { validators = loadSchemas(); }
catch (e) { errors.push(e.message); }

const collections = Object.fromEntries(Object.keys(ENTITY_DIRS).map((c) => [c, []]));
for (const coll of Object.keys(ENTITY_DIRS)) {
  const dir = join(dataDir, coll);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    let rec;
    try { rec = JSON.parse(readFileSync(join(dir, f), 'utf8')); }
    catch (e) { errors.push(`JSON 语法错误 ${coll}/${f}: ${e.message}`); continue; }
    if (validators[coll] && !validators[coll](rec)) {
      for (const er of validators[coll].errors)
        errors.push(`Schema ${coll}/${f}: ${er.instancePath || '/'} ${er.message}`);
    }
    collections[coll].push({ rec, file: `${coll}/${f}` });
  }
}

// C. 业务规则
const ids = new Map(), slugs = new Map();
const allIds = new Set();
for (const [coll, list] of Object.entries(collections))
  for (const { rec, file } of list) {
    if (rec.id) {
      if (ids.has(rec.id)) errors.push(`ID 重复 ${rec.id}（${file} 与 ${ids.get(rec.id)}）`);
      ids.set(rec.id, file); allIds.add(rec.id);
    }
    if (rec.slug) {
      if (slugs.has(rec.slug)) errors.push(`slug 重复 ${rec.slug}（${file} 与 ${slugs.get(rec.slug)}）`);
      slugs.set(rec.slug, file);
    }
  }
const ref = (val) => val && !allIds.has(val);
for (const { rec, file } of collections.entries) {
  if (ref(rec.siteId)) errors.push(`必填关联缺失 ${file}: siteId=${rec.siteId} 指向不存在的 Site`);
  if (ref(rec.gameId)) warnings.push(`可选关联悬空 ${file}: gameId=${rec.gameId}`);
}
for (const { rec, file } of collections.tools) {
  for (const g of rec.supportedGames ?? []) if (ref(g)) warnings.push(`可选关联悬空 ${file}: supportedGames→${g}`);
  if (ref(rec.officialSiteId)) warnings.push(`可选关联悬空 ${file}: officialSiteId=${rec.officialSiteId}`);
}
for (const { rec, file } of collections.guides)
  for (const [k, v] of Object.entries({ games: rec.games, tools: rec.tools, relatedGuides: rec.relatedGuides, relatedEntries: rec.relatedEntries }))
    for (const g of v ?? []) if (ref(g)) warnings.push(`可选关联悬空 ${file}: ${k}→${g}`);
for (const { rec, file } of collections.games) {
  for (const g of rec.relatedGameIds ?? []) if (ref(g)) warnings.push(`可选关联悬空 ${file}: relatedGameIds→${g}`);
  for (const [i, faq] of (rec.faqs ?? []).entries())
    if (!faq.answer && !faq.guideId) errors.push(`FAQ[${i}] ${file}: answer 与 guideId 至少其一（docs/04 §2.1）`);
    else if (ref(faq.guideId)) warnings.push(`可选关联悬空 ${file}: faq.guideId=${faq.guideId}`);
}
for (const { rec, file } of collections.offers)
  if (ref(rec.gameId)) warnings.push(`可选关联悬空 ${file}: gameId=${rec.gameId}`);

// published 未达标 → 警告（页不会生成，但不阻断）
for (const [coll, list] of Object.entries(collections))
  for (const { rec, file } of list)
    if (rec.publishStatus === 'published' && rec._demo !== true && !isEligible(ENTITY_DIRS[coll], rec))
      warnings.push(`published 未达最低标准 ${file}（不会生成页面/索引）`);

for (const m of warnings) console.log('[警告]', m);
for (const m of errors) console.log('[阻断]', m);
console.log(`校验完成（数据源 ${useCustomDir ? argDir : 'data'}）：${errors.length} 阻断 / ${warnings.length} 警告`);
process.exit(errors.length ? 1 : 0);
