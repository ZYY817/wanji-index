'use client';
import * as React from 'react';
import * as T from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';

// 胶囊分段控件：照 tabs-nova.tsx 改为中性胶囊分段
export function ToggleGroup({ className, ...props }: React.ComponentProps<typeof T.Root>) {
  return (
    <T.Root
      className={cn(
        'inline-flex h-9 items-center gap-0.5 rounded-full bg-white/[0.07] p-[3px]',
        className,
      )}
      {...(props as any)}
    />
  );
}

export function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof T.Item>) {
  return (
    <T.Item
      className={cn(
        'touch-target inline-flex h-[30px] min-w-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-fg-2 transition-colors hover:text-foreground data-[state=on]:bg-white/[0.14] data-[state=on]:text-foreground data-[state=on]:shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  );
}
