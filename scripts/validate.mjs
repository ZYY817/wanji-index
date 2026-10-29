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
import { computeLifecycle } from '../src/lib/lifecycle.mjs';
import { mergeAuto } from '../src/lib/merge-auto.mjs';

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
const autoRecs = Object.fromEntries(Object.keys(ENTITY_DIRS).map((c) => [c, []]));
// 人工数据 data/<集合>/ 与自动收录 data/auto/<集合>/ 都按同一份 schema 校验；之后按 merge-auto 的规则合并
for (const [base, bucket, label] of [['', collections, ''], ['auto', autoRecs, 'auto/']]) {
  for (const coll of Object.keys(ENTITY_DIRS)) {
    const dir = join(dataDir, base, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      let rec;
      try { rec = JSON.parse(readFileSync(join(dir, f), 'utf8')); }
      catch (e) { errors.push(`JSON 语法错误 ${label}${coll}/${f}: ${e.message}`); continue; }
      if (validators[coll] && !validators[coll](rec)) {
        for (const er of validators[coll].errors)
          errors.push(`Schema ${label}${coll}/${f}: ${er.instancePath || '/'} ${er.message}`);
      }
      bucket[coll].push({ rec, file: `${label}${coll}/${f}` });
    }
  }
}
// 合并：与人工记录重复的自动记录不再单独参与后续检查（其补充字段已并入人工记录）
{
  const merged = mergeAuto(
    Object.fromEntries(Object.entries(collections).map(([c, l]) => [c, l.map((x) => x.rec)])),
    Object.fromEntries(Object.entries(autoRecs).map(([c, l]) => [c, l.map((x) => x.rec)])),
  );
  for (const coll of ['games', 'offers', 'entries']) {
    const fileOf = new Map([...collections[coll], ...autoRecs[coll]].map((x) => [x.rec, x.file]));
    const handFile = new Map(collections[coll].map((x) => [x.rec.id, x.file]));
    collections[coll] = merged[coll].map((rec) => ({ rec, file: fileOf.get(rec) ?? handFile.get(rec.id) ?? `${coll}/${rec.id}.json` }));
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
for (const { rec, file } of collections.problems ?? []) {
  for (const p of rec.relatedProblems ?? []) if (ref(p)) warnings.push(`可选关联悬空 ${file}: relatedProblems→${p}`);
  for (const [i, f] of (rec.fixes ?? []).entries())
    if (ref(f.guideId)) warnings.push(`可选关联悬空 ${file}: fixes[${i}].guideId=${f.guideId}`);
  // 常识性步骤可以是本站自己写的说明；但整个问题至少要引用一个外部来源或站内教程
  if (!(rec.fixes ?? []).some((f) => f.guideId || f.sources?.length)) errors.push(`问题 ${file}: 解法里至少要有一个来源或站内教程`);
}
for (const { rec, file } of collections.offers)
  if (ref(rec.gameId)) warnings.push(`可选关联悬空 ${file}: gameId=${rec.gameId}`);

// 免费情报的时效提醒：已结束超过 7 天的建议清理；没有进行中 / 即将开始的限时领取时提醒更新
{
  const now = Date.now();
  const staleDays = loadSiteConfig().review?.staleDays?.offerTimed ?? 14;
  const lcOf = (rec) => computeLifecycle(rec, now, staleDays);
  for (const { rec, file } of collections.offers) {
    const end = rec.endDate ? Date.parse(/T/.test(rec.endDate) ? rec.endDate : rec.endDate + 'T23:59:59+08:00') : NaN;
    if (lcOf(rec) === 'ended' && now - end > 7 * 864e5) warnings.push(`免费情报已结束 ${Math.floor((now - end) / 864e5)} 天 ${file}（建议删除或改为下一期）`);
  }
  const live = collections.offers.filter(({ rec }) => rec.type === 'limited' && ['active', 'upcoming'].includes(lcOf(rec)));
  if (!live.length) warnings.push('当前没有进行中或即将开始的限时领取——首页免费章只剩长期免费，记得补上新一期');
}

// published 未达标 → 警告（页不会生成，但不阻断）
for (const [coll, list] of Object.entries(collections))
  for (const { rec, file } of list)
    if (rec.publishStatus === 'published' && rec._demo !== true && !isEligible(ENTITY_DIRS[coll], rec))
      warnings.push(`published 未达最低标准 ${file}（不会生成页面/索引）`);

for (const m of warnings) console.log('[警告]', m);
for (const m of errors) console.log('[阻断]', m);
console.log(`校验完成（数据源 ${useCustomDir ? argDir : 'data'}）：${errors.length} 阻断 / ${warnings.length} 警告`);
process.exit(errors.length ? 1 : 0);
