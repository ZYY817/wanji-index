import { cn } from '@/lib/utils';

/**
 * 键帽：浅灰小圆角块（macOS 菜单里快捷键的样式），不做立体倒角。
 */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 select-none items-center justify-center rounded-[5px] bg-white/[0.08] px-1.5 font-sans text-2xs font-medium leading-none text-fg-2 ring-1 ring-inset ring-white/[0.06]',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
