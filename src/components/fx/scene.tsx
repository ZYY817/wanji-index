'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useMedia, useMotionOK } from './hooks';

/**
 * 首页章节容器：「接力」（relay）。
 *
 * 进场（本章顶边从视口底部移到顶部的那一屏滚动）：用 translateY 抵消滚动，让本章从第一帧起就固定在视口里、完全不透明。
 *   本章自己负责在这段「进场窗口」里先画出上一章的最后一帧，再完成交接动作（每章用 useEntry() 读取进场进度）。
 *   不再有两层半透明画面叠在一起。
 * 离场：上一章在下一章进场期间保持定格（hold），被不透明的下一章盖住；若下一章外围透明（如装机的光斑），透出的就是这张定格。
 *
 * - 只在桌面 + 未开启 reduced-motion 时生效；否则是普通容器（SSR 首帧即此状态）
 * - 只动 transform；order 决定层叠（后出场的在上）；data-chapter 供脚本识别章节
 * - enter={false}：不固定进场（首屏）；hold={false}：离场不定格（最后一章，后面直接接片尾）
 */
export function Scene({ children, order, enter = true, hold = true }: { children: React.ReactNode; order: number; enter?: boolean; hold?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useMotionOK();
  // 与首页开场镜头（Film）同一门槛：只有连续镜头存在时，接力才有「上一章的最后一帧」可接
  const desktop = useMedia('(min-width: 1280px)');
  const on = ok && desktop;

  const { scrollYProgress: inP } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const { scrollYProgress: outP } = useScroll({ target: ref, offset: ['end end', 'end start'] });

  // v = 0 表示还没进入窗口：保持原位，避免提前叠到上一章上方挡住点击
  const inY = useTransform(inP, (v) => (on && enter && v > 0 ? (v - 1) * 100 : 0));
  const outY = useTransform(outP, (v) => (on && hold ? v * 100 : 0));
  const y = useTransform(() => `${inY.get() + outY.get()}vh`);

  return (
    <motion.div ref={ref} data-chapter className="relative" style={{ y, zIndex: order }}>
      {children}
    </motion.div>
  );
}

/** 章节进场窗口的进度（0 = 本章顶边刚到视口底部，1 = 本章固定到视口顶部）。与 Scene 的 relay 配合使用。 */
export function useEntry(target: React.RefObject<HTMLElement | null>) {
  return useScroll({ target, offset: ['start end', 'start start'] }).scrollYProgress;
}
