import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowUpRight, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

// 规则：variant="solid"（信号橙实心）只给「获取 / 购买 / 领取 / 下载」；导航一律 outline / ghost / link
export const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none [&_svg]:size-[1.05em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline: 'border border-border-strong text-foreground hover:border-foreground/70 hover:bg-foreground/[0.04]',
        ghost: 'text-fg-2 hover:bg-surface-2 hover:text-foreground',
        link: 'px-0 text-foreground underline decoration-primary decoration-1 underline-offset-[5px] hover:text-primary',
        paper: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink/[0.04]',
        disabled: 'border border-dashed border-border-strong text-fg-3',
      },
      size: {
        sm: 'h-8 rounded-sm px-3 text-sm',
        md: 'h-11 rounded-sm px-5 text-base',
        lg: 'h-12 rounded-sm px-6 text-base',
        icon: 'size-11 rounded-sm',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto' }],
    defaultVariants: { variant: 'outline', size: 'md' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

/** 获取类主按钮（外链）：dead → 不可点禁用态 +「已失效」 */
export function AcquireButton({
  href, health, label = '获取', size = 'md', className,
}: { href: string; health?: string; label?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  if (health === 'dead')
    return (
      <span aria-disabled="true" className={cn(buttonVariants({ variant: 'disabled', size }), 'cursor-not-allowed', className)}>
        <Ban aria-hidden /> 已失效
      </span>
    );
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'solid', size }), className)}>
      {label} <ArrowUpRight aria-hidden />
      <span className="sr-only">（在新窗口打开）</span>
    </a>
  );
}
