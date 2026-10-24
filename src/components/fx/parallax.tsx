'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { useIsDesktop, useMotionOK } from './hooks';

// 视差层：元素穿过视口时在 [-distance, +distance] 间平移（只动 transform）。
// 移动端幅度 ×0.4；reduced-motion 下静止。
export function Parallax({
  children, distance = 80, className, smooth = false, scaleFrom,
}: { children: React.ReactNode; distance?: number; className?: string; smooth?: boolean; scaleFrom?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const d = ok ? (desktop ? distance : distance * 0.4) : 0;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const raw = useTransform(scrollYProgress, [0, 1], [-d, d]);
  const sp = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });
  const scale = useTransform(scrollYProgress, [0, 1], [ok && scaleFrom ? scaleFrom : 1, 1]);
  return (
    <motion.div ref={ref} className={cn(className)} style={{ y: smooth ? sp : raw, scale }}>
      {children}
    </motion.div>
  );
}
