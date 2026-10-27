'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { NAV, type NavCounts, navActive } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/components/fx/tokens';

const LIST: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

function Row({
  no, href, label, count, active,
}: {
  no: string; href: string; label: string; count?: number; active: boolean;
}) {
  return (
    <motion.li variants={ITEM}>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className="group relative flex min-h-[68px] items-center gap-3 border-b border-border/80 py-3"
      >
        {active && <span aria-hidden className="absolute left-0 top-4 bottom-4 w-px bg-primary" />}
        <span className={cn('meta w-8 shrink-0 leading-none', active ? 'text-primary' : 'text-fg-3')}>{no}</span>
        <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
          <span
            className={cn(
              'font-serif text-[clamp(27px,7.8vw,32px)] font-black leading-none tracking-[-0.04em] transition-colors',
              active ? 'text-primary' : 'text-foreground',
            )}
          >
            {label}
          </span>
          <span className="flex shrink-0 items-baseline gap-2">
            {count != null && (
              <span className={cn('meta text-2xs leading-none', active ? 'text-primary' : 'text-fg-3')}>
                {String(count).padStart(2, '0')}
              </span>
            )}
          </span>
        </span>
      </Link>
    </motion.li>
  );
}

// 移动端：全屏宋体编号目录。面板从右侧揭入，条目逐条自下而上落定（reduced-motion 下静态呈现）
export function MobileMenu({ counts, pathname }: { counts: NavCounts; pathname: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative grid size-11 place-items-center lg:hidden"
        aria-label="打开目录"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span aria-hidden className="flex w-[18px] flex-col items-end gap-[5px]">
          <span className="h-px w-full bg-foreground transition-[width] duration-300 group-hover:w-[13px]" />
          <span className="h-px w-[13px] bg-foreground/65 transition-[width] duration-300 group-hover:w-full" />
        </span>
      </button>

      <DialogContent className="inset-0 flex flex-col bg-shell p-0">
        <DialogTitle className="sr-only">站点目录</DialogTitle>
        <DialogDescription className="sr-only">玩机索引的全部栏目</DialogDescription>

        <motion.div
          initial={reduced ? false : { x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: EASE_OUT }}
          className="flex h-full min-h-0 flex-col bg-shell"
        >
          <div className="relative flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-[var(--gutter)]">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="relative grid size-4 place-items-center">
                <span className="absolute inset-0 rounded-full border border-fg-3/70" />
                <span className="size-[3px] rounded-full bg-foreground" />
              </span>
              <span className="font-serif text-lg font-black tracking-[-0.04em]">玩机索引</span>
              <span className="meta text-2xs leading-none text-fg-3">/ 目录</span>
            </div>
            <DialogClose className="grid size-11 place-items-center text-fg-2 transition-colors hover:text-foreground" aria-label="关闭目录">
              <X className="size-5" aria-hidden />
            </DialogClose>
          </div>

          <nav
            aria-label="移动端导航"
            data-lenis-prevent
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-[var(--gutter)]"
          >
            <div className="meta flex items-center justify-between py-4 text-fg-3">
              <span>Index / 全站目录</span>
              <span>08 项</span>
            </div>

            <motion.ul variants={LIST} initial={reduced ? false : 'hidden'} animate={reduced ? false : 'show'}>
              <Row no="00" href="/" label="首页" active={pathname === '/'} />
              {NAV.map((n) => (
                <Row
                  key={n.href}
                  no={n.no}
                  href={n.href}
                  label={n.label}
                  count={counts[n.key]}
                  active={navActive(n, pathname)}
                />
              ))}
              <Row no="08" href="/about/" label="关于本站" active={pathname.startsWith('/about')} />
            </motion.ul>

            <div className="mt-8 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-border-strong" />
              <span className="meta text-2xs leading-none text-fg-3">PC 游戏资源，一处收齐</span>
            </div>
          </nav>

          <div className="shrink-0 border-t border-border px-[var(--gutter)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <p className="meta flex items-center justify-between gap-4 text-2xs leading-none text-fg-3">
              <span className="truncate">全部免费 · 随时更新</span>
              <span className="inline-flex shrink-0 items-center gap-1.5">
                <Kbd className="h-[18px] min-w-[18px] px-1 text-2xs">ESC</Kbd>
                关闭
              </span>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
