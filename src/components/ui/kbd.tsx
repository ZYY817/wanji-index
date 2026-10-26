import { cn } from '@/lib/utils';

/**
 * 机械键帽组件（Origin UI / Claude Code 风格）：
 * 具备物理键帽下边缘倒角（border-b-2）与按压微位移动效（active:translate-y-0.5），触感强烈。
 */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 select-none items-center justify-center rounded-xs border border-border-strong border-b-2 bg-surface-2 px-1.5 font-mono text-2xs font-semibold leading-none text-fg-2 shadow-2xs transition-transform active:translate-y-0.5 active:border-b',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
