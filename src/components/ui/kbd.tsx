import { cn } from '@/lib/utils';

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border-strong px-1.5 font-mono text-2xs font-medium leading-none text-fg-2',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
