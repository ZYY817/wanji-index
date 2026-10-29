import { T } from '@/lib/i18n';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { ArrowUpRight, Ban, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * 全站按钮只有这几种，页面里不要再手写按钮样式：
 *   solid   蓝色胶囊——只给「获取 / 购买 / 领取 / 下载」（AcquireButton），一屏里尽量只有一个
 *   get     浅灰胶囊 + 蓝字（App Store「获取」）——列表行里的获取按钮，避免一列实心按钮
 *   outline 浅灰胶囊——次要操作（清除筛选、回到顶部等）；不用描边框
 *   ink     深色胶囊——浅色章节（装机）里的主按钮
 *   paper   浅色章节里的次要按钮
 *   导航到站内页面的文字入口用 TextLink（下划线 + 箭头），不用按钮
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium tracking-[-0.005em] transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none [&_svg]:size-[1em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: 'bg-cta text-cta-foreground hover:bg-cta-hover',
        get: 'bg-white/[0.1] font-semibold text-primary hover:bg-white/[0.16]',
        outline: 'bg-white/[0.08] text-foreground hover:bg-white/[0.14]',
        ghost: 'text-fg-2 hover:bg-white/[0.08] hover:text-foreground',
        link: 'px-0 text-foreground underline decoration-primary decoration-1 underline-offset-[5px] hover:text-primary',
        ink: 'bg-ink text-paper hover:bg-ink/85',
        paper: 'bg-ink/[0.06] text-ink hover:bg-ink/[0.1]',
        disabled: 'bg-white/[0.05] text-fg-3',
      },
      size: {
        sm: 'h-8 px-3.5 text-sm',
        md: 'h-10 px-5 text-[15px]',
        lg: 'h-12 px-7 text-[17px]',
        icon: 'size-10',
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
  href, health, label = <T zh="获取" en="Get" />, size = 'md', variant = 'solid', className,
}: { href: string; health?: string; label?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; variant?: 'solid' | 'get'; className?: string }) {
  if (health === 'dead')
    return (
      <span aria-disabled="true" className={cn(buttonVariants({ variant: 'disabled', size }), 'cursor-not-allowed', className)}>
        <Ban aria-hidden /> <T zh="已失效" en="Broken" />
      </span>
    );
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant, size }), className)}>
      {label}{variant === 'solid' && <ArrowUpRight aria-hidden />}
      <span className="sr-only"><T zh="（在新窗口打开）" en="(opens in a new window)" /></span>
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
        'group inline-flex min-h-11 items-center gap-1 text-base transition-colors',
        tone === 'ink' ? 'text-ink underline-offset-4 hover:underline' : tone === 'accent' ? 'text-foreground hover:text-[var(--accent)]' : 'text-primary hover:underline',
        'underline-offset-4',
        className,
      )}
    >
      <span>{children}</span>
      {arrow && <ChevronRight aria-hidden className="size-[1em] transition-transform group-hover:translate-x-0.5" />}
    </Link>
  );
}
