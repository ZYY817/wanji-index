// 生命周期判定单元测试（docs/04 §4.5；M1 接入正式工程）
// computeLifecycle 为纯函数（src/lib/lifecycle.mjs），构建期与浏览器共用同一源
import { computeLifecycle } from '../src/lib/lifecycle.mjs';

const now = Date.parse('2026-10-24T12:00:00+08:00');
let pass = 0, fail = 0;
const T = (name, offer, expected, n = now) => {
  const got = computeLifecycle(offer, n, 14);
  if (got === expected) { pass++; console.log(`✓ ${name} → ${got}`); }
  else { fail++; console.log(`✗ ${name}：预期 ${expected}，实际 ${got}`); }
};

T('进行中', { type: 'limited', endDate: '2026-10-30', checkedAt: '2026-10-23' }, 'active');
T('已结束', { type: 'limited', endDate: '2026-10-20', checkedAt: '2026-10-23' }, 'ended');
T('未开始', { type: 'limited', startDate: '2026-11-01', endDate: '2026-11-10', checkedAt: '2026-10-23' }, 'upcoming');
T('截止不明', { type: 'limited', checkedAt: '2026-10-23' }, 'deadline_unknown');
T('仅日期 endDate 当日仍有效', { type: 'limited', endDate: '2026-10-24', checkedAt: '2026-10-23' }, 'active');
T('startDate 晚于 endDate', { type: 'limited', startDate: '2026-11-01', endDate: '2026-10-30', checkedAt: '2026-10-23' }, 'uncertain');
T('非法日期', { type: 'limited', endDate: 'not-a-date', checkedAt: '2026-10-23' }, 'uncertain');
T('endDate 存在但 startDate 非法', { type: 'limited', startDate: 'bad', endDate: '2026-10-30', checkedAt: '2026-10-23' }, 'uncertain');
T('checkedAt 超 staleDays(14)', { type: 'limited', endDate: '2026-11-30', checkedAt: '2026-10-01' }, 'uncertain');
T('checkedAt 14 天内', { type: 'limited', endDate: '2026-11-30', checkedAt: '2026-10-11' }, 'active');
T('weekend 进行中', { type: 'weekend', startDate: '2026-10-23', endDate: '2026-10-26', checkedAt: '2026-10-23' }, 'active');
T('permanent 不适用', { type: 'permanent', checkedAt: '2026-10-23' }, null);
T('opensource 不适用', { type: 'opensource', checkedAt: '2026-10-23' }, null);
T('trial 无时间字段=不适用', { type: 'trial', checkedAt: '2026-10-23' }, null);
T('trial 有时间字段=适用', { type: 'trial', startDate: '2026-10-01', endDate: '2026-12-31', checkedAt: '2026-10-23' }, 'active');
T('datetime 精确边界前一刻', { type: 'limited', endDate: '2026-10-24T12:00:00+08:00', checkedAt: '2026-10-23' }, 'active',
  Date.parse('2026-10-24T11:59:59+08:00'));

console.log(`\n生命周期：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
