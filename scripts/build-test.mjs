// 测试构建：用 tests/fixtures-data 作为数据源构建到 dist-test/，与正式 data/ 隔离
// （Windows 下 npm script 内联环境变量不可移植，故经本脚本设置）
import { spawnSync } from 'node:child_process';

const env = { ...process.env, DATA_DIR: 'tests/fixtures-data' };
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, env });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run('npx', ['astro', 'build', '--outDir', 'dist-test']);
run('node', ['scripts/check-artifacts.mjs', 'dist-test']);
