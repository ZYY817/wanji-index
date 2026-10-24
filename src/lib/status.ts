// 两套徽标的唯一映射：生命周期 = 实心（lifecycle.mjs 的返回值），状态 = 描边（链接健康 / 核验 / 步骤验证）
export type LifecycleKey = 'active' | 'upcoming' | 'ended' | 'deadline_unknown' | 'uncertain';
export type StatusKey = 'suspect' | 'dead' | 'unchecked' | 'unverified' | 'verified' | 'self' | 'community';

export const LIFECYCLE: Record<LifecycleKey, { label: string; tone: string }> = {
  active: { label: '进行中', tone: 'var(--color-ok)' },
  upcoming: { label: '预告', tone: 'var(--color-info)' },
  ended: { label: '已结束', tone: 'var(--color-ended)' },
  deadline_unknown: { label: '长期进行', tone: 'var(--color-ongoing)' },
  uncertain: { label: '待确认', tone: 'var(--color-warn)' },
};

export const STATUS: Record<StatusKey, { label: string; tone: string; dashed?: boolean }> = {
  suspect: { label: '疑似失效', tone: 'var(--color-warn)' },
  dead: { label: '已失效', tone: 'var(--color-bad)' },
  unchecked: { label: '待核验', tone: 'var(--color-fg-3)', dashed: true },
  unverified: { label: '待核验', tone: 'var(--color-fg-3)', dashed: true },
  verified: { label: '已验证', tone: 'var(--color-ok)' },
  self: { label: '亲测', tone: 'var(--color-ok)' },
  community: { label: '社区验证', tone: 'var(--color-info)' },
};

/** 链接健康 → 需要展示的状态徽标（ok 不展示） */
export function healthStatus(h?: string): StatusKey | null {
  return h === 'suspect' || h === 'dead' || h === 'unchecked' ? h : null;
}
