import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// 外链统一出口：新窗口 + noopener noreferrer；dead → 不可点禁用态 +「已失效」
export function ExtLink({
  href, health, children, className, icon = true,
}: { href: string; health?: string; children: React.ReactNode; className?: string; icon?: boolean }) {
  if (health === 'dead')
    return (
      <span aria-disabled="true" className={cn('cursor-not-allowed text-fg-3 line-through decoration-fg-3/60', className)}>
        {children}
        <span className="ml-2 font-mono text-2xs tracking-[0.04em] text-bad no-underline">已失效</span>
      </span>
    );
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn('group/ext inline-flex items-baseline gap-1', className)}>
      {children}
      {icon && <ArrowUpRight aria-hidden className="size-[0.9em] translate-y-[0.1em] opacity-60 transition-transform group-hover/ext:-translate-y-[0.05em] group-hover/ext:translate-x-[0.1em] group-hover/ext:opacity-100" />}
      <span className="sr-only">（在新窗口打开）</span>
    </a>
  );
}
