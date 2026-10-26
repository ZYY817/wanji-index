import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * 全站按钮只有这几种，页面里不要再手写按钮样式：
 *   solid   香槟金实底——只给「获取 / 购买 / 领取 / 下载」（AcquireButton）
 *   outline 描边——次要操作（清除筛选、回到顶部等）
 *   ink     墨色实底——浅色纸面章节（装机）里的主按钮
 *   paper   纸面描边——浅色纸面章节里的次要按钮
 *   导航到站内页面的文字入口用 TextLink（下划线 + 箭头），不用按钮
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none [&_svg]:size-[1.05em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline: 'border border-border-strong text-foreground hover:border-foreground/70 hover:bg-foreground/[0.04]',
        ghost: 'text-fg-2 hover:bg-surface-2 hover:text-foreground',
        link: 'px-0 text-foreground underline decoration-primary decoration-1 underline-offset-[5px] hover:text-primary',
        ink: 'bg-ink text-paper hover:bg-ink/85',
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

/**
 * 站内文字入口：「查看全部资源站 →」这类。正文字号、下划线、箭头随悬停右移；点击区域不小于 44px 高。
 * tone="accent" 时下划线跟随所在章节的强调色（CSS 变量 --accent）。
 */
export function TextLink({
  href, children, arrow = true, tone = 'primary', className,
}: { href: string; children: React.ReactNode; arrow?: boolean; tone?: 'primary' | 'accent' | 'ink'; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex min-h-11 items-center gap-2 text-base transition-colors',
        tone === 'ink' ? 'text-ink hover:text-ink/70' : 'text-foreground',
        tone === 'accent' ? 'hover:text-[var(--accent)]' : tone === 'primary' && 'hover:text-primary',
        className,
      )}
    >
      <span className={cn('border-b pb-0.5', tone === 'accent' ? 'border-[var(--accent)]' : tone === 'ink' ? 'border-ink/60' : 'border-primary')}>{children}</span>
      {arrow && <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />}
    </Link>
  );
}
