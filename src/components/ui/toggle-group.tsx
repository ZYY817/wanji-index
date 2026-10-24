'use client';
import * as React from 'react';
import * as T from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';

// 分段控件 / 多选 toggle：发丝线外框 + 方角；激活项反白
export function ToggleGroup({ className, ...props }: React.ComponentProps<typeof T.Root>) {
  return <T.Root className={cn('inline-flex items-stretch rounded-sm border border-border-strong p-[3px]', className)} {...(props as any)} />;
}

export function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof T.Item>) {
  return (
    <T.Item
      className={cn(
        'touch-target inline-flex h-8 min-w-9 items-center justify-center gap-1.5 rounded-xs px-2.5 text-sm text-fg-2 transition-colors hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-background',
        className,
      )}
      {...props}
    />
  );
}
