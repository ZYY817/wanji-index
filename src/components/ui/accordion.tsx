'use client';
import * as React from 'react';
import * as A from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = A.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof A.Item>) {
  return <A.Item className={cn('border-b border-border', className)} {...props} />;
}

export function AccordionTrigger({ className, children, index, ...props }: React.ComponentProps<typeof A.Trigger> & { index?: number }) {
  return (
    <A.Header className="flex">
      <A.Trigger
        className={cn(
          'group flex min-h-14 flex-1 items-center gap-4 py-4 text-left text-base font-medium transition-colors hover:text-foreground focus-visible:outline-offset-[-2px]',
          className,
        )}
        {...props}
      >
        {index != null && <span className="meta w-6 shrink-0 text-fg-3">{String(index).padStart(2, '0')}</span>}
        <span className="flex-1">{children}</span>
        <Plus aria-hidden className="size-4 shrink-0 text-fg-3 transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-primary" />
      </A.Trigger>
    </A.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof A.Content>) {
  return (
    <A.Content className="overflow-hidden text-base text-fg-2" {...props}>
      <div className={cn('pb-5 pl-10 pr-8', className)}>{children}</div>
    </A.Content>
  );
}
