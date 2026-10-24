'use client';
import * as React from 'react';
import * as D from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;

export function DialogOverlay({ className, ...props }: React.ComponentProps<typeof D.Overlay>) {
  return <D.Overlay className={cn('fixed inset-0 z-[80] bg-black/75', className)} {...props} />;
}

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof D.Content>) {
  return (
    <D.Portal>
      <DialogOverlay />
      <D.Content className={cn('fixed z-[90] outline-none', className)} {...props}>
        {children}
      </D.Content>
    </D.Portal>
  );
}
