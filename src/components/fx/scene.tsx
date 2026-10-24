'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useIsDesktop, useMotionOK } from './hooks';

/**
 * 首页章节过场（Apple 产品页式的「接力」）：
 * 当本章的末尾离开视口时（最后一屏），内容缓慢下沉、轻微缩小并压暗；下一章层级更高，从下方盖上来。
 * 视觉上是一镜到底，而不是一条分隔线的硬切。
 *
 * - 只在桌面 + 未开启 reduced-motion 时生效；否则是一个普通容器
 * - 只动 transform / opacity；`order` 决定层叠顺序（后出场的章节在上）
 * - 带 data-chapter，供右缘章节进度轨（useChapterIndex）识别
 */
export function Scene({ children, order }: { children: React.ReactNode; order: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const on = ok && desktop;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['end end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, on ? 140 : 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, on ? 0.94 : 1]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, on ? 0.72 : 0]);

  return (
    <motion.div ref={ref} data-chapter className="relative" style={{ y, scale, zIndex: order, transformOrigin: '50% 100%' }}>
      {children}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-background" style={{ opacity: shade }} />
    </motion.div>
  );
}
