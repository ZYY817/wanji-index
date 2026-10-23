import { StatusBadge } from './badges';

// 外链：dead → 降级为禁用态文本；正常 → target=_blank + rel 语义 + 站名标注
export function ExtLink({ href, label, health, site, className = '' }: {
  href: string; label: string; health?: string; site?: string; className?: string;
}) {
  if (health === 'dead')
    return <span className={`inline-flex items-center gap-1.5 text-[var(--color-txt-3)] line-through ${className}`}>{label} <StatusBadge kind="dead" /></span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-[var(--color-amber-hi)] hover:underline ${className}`}>
      {label}<span aria-hidden="true" className="text-xs">↗</span>
      {site && <span className="meta">·{site}</span>}
      {health === 'suspect' && <StatusBadge kind="suspect" />}
    </a>
  );
}
