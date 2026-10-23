// Schema 加载器（仅限 Node 侧：scripts/validate.mjs 使用）
// 职责：读 schemas/*.schema.json，把 {x-enum: "名"} 占位替换为 enums.json 对应数组——
// 枚举值仍然只有 config/enums.json 一个维护源，Schema 不重复抄枚举。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';
import { loadEnums, PROJECT_ROOT } from './config.mjs';

export const ENTITY_DIRS = {
  games: 'game', sites: 'site', entries: 'entry',
  tools: 'tool', guides: 'guide', offers: 'offer',
};

function injectEnums(node, enums) {
  if (Array.isArray(node)) return node.map((n) => injectEnums(n, enums));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === 'x-enum') {
        if (!Array.isArray(enums[v])) throw new Error(`[schema] x-enum "${v}" 在 enums.json 中不存在`);
        out.enum = enums[v];
      } else out[k] = injectEnums(v, enums);
    }
    return out;
  }
  return node;
}

export function loadSchemas() {
  const enums = loadEnums();
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validators = {};
  const dir = join(PROJECT_ROOT, 'schemas');
  for (const [coll, type] of Object.entries(ENTITY_DIRS)) {
    const file = join(dir, `${type}.schema.json`);
    let schema;
    try { schema = JSON.parse(readFileSync(file, 'utf8')); }
    catch (e) { throw new Error(`[schema] ${type}.schema.json 读取失败：${e.message}`); }
    validators[coll] = ajv.compile(injectEnums(schema, enums));
  }
  return validators;
}
