'use client';
import * as React from 'react';
import * as D from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DropdownMenu = D.Root;
export const DropdownMenuTrigger = D.Trigger;
export const DropdownMenuRadioGroup = D.RadioGroup;

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-44 rounded-lg bg-popover p-1 text-popover-foreground ring-1 ring-white/[0.08] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]',
          className,
        )}
        {...props}
      />
    </D.Portal>
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof D.Label>) {
  return <D.Label className={cn('meta px-2.5 pb-1.5 pt-2 text-fg-3', className)} {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof D.RadioItem>) {
  return (
    <D.RadioItem
      className={cn(
        'relative flex h-10 cursor-pointer select-none items-center gap-2 rounded-sm pl-8 pr-3 text-sm text-fg-2 outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-foreground data-[state=checked]:text-foreground lg:h-9',
        className,
      )}
      {...props}
    >
      <D.ItemIndicator className="absolute left-2.5 inline-flex">
        <Check className="size-3.5 text-primary" aria-hidden />
      </D.ItemIndicator>
      {children}
    </D.RadioItem>
  );
}
