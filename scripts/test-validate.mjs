// 负向校验测试：tests/bad/ 下每个用例目录都必须让 validate 非零退出（被拦截）
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PROJECT_ROOT } from '../src/lib/config.mjs';

const badRoot = join(PROJECT_ROOT, 'tests', 'bad');
const cases = readdirSync(badRoot).filter((d) => {
  try { return readdirSync(join(badRoot, d)).length > 0; } catch { return false; }
});

let pass = 0, fail = 0;
for (const c of cases) {
  const r = spawnSync('node', ['scripts/validate.mjs', '--data', `tests/bad/${c}`],
    { cwd: PROJECT_ROOT, shell: true, encoding: 'utf8' });
  const blocked = r.status !== 0;
  const detail = (r.stdout + r.stderr).split('\n').find((l) => l.includes('[阻断]'))?.trim();
  if (blocked) { pass++; console.log(`✓ ${c} 已拦截：${detail ?? ''}`); }
  else { fail++; console.log(`✗ ${c} 未被拦截（预期非零退出，实际 0）`); }
}
console.log(`\n负向校验：${pass}/${cases.length} 拦截`);
process.exit(fail ? 1 : 0);
