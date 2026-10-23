import Link from 'next/link';

// 实色按钮白名单（硬规则保留）：仅获取/购买/领取类动作用 btn-acq
export function AcquireButton({ href, label = '前往', health }: { href: string; label?: string; health?: string }) {
  if (health === 'dead') return <span className="btn-acq dead">链接失效</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="btn-acq">{label} ↗</a>;
}

export function OutlineButton({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const cls = 'btn-line';
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label} ↗</a>
    : <Link href={href} className={cls}>{label} →</Link>;
}
