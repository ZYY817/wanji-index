// 测试构建：DATA_DIR=tests/fixtures-data → next build → check-artifacts
// 验证 fixture 过滤链端到端（draft/demo/offline 不入产物）
import { spawnSync } from 'node:child_process';

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, DATA_DIR: 'tests/fixtures-data' }, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run('node', ['scripts/validate.mjs', '--data', 'tests/fixtures-data']);
run('npx', ['next', 'build']);
run('node', ['scripts/gen-redirects.mjs']);
run('node', ['scripts/check-artifacts.mjs', 'out']);
