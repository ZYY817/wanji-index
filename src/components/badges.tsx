// 双轨徽标（保留硬规则：LifecycleBadge=实心，StatusBadge=描边，形态不可混用）
const LC_LABEL: Record<string, string> = {
  active: '进行中', upcoming: '预告', ended: '已结束', deadline_unknown: '长期进行', uncertain: '待确认',
};
const ST_LABEL: Record<string, string> = {
  suspect: '疑似失效', dead: '已失效', unverified: '待核验', unchecked: '待核验',
  verified: '已验证', self: '亲测', community: '社区验证',
};

export function LifecycleBadge({ state }: { state: string }) {
  return <span className={`lc lc-${state}`}>{LC_LABEL[state] ?? state}</span>;
}

export function StatusBadge({ kind }: { kind: string }) {
  return <span className={`st st-${kind}`}>{ST_LABEL[kind] ?? kind}</span>;
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}
