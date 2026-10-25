'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { transform, useReducedMotion, useTransform, type MotionValue } from 'motion/react';

function subscribeMQ(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
}

/** 媒体查询（SSR 回退 false —— 桌面效果只在客户端确认后启用，保证 SSR 是静态可读版本） */
export function useMedia(query: string, ssr = false) {
  return useSyncExternalStore(subscribeMQ(query), () => window.matchMedia(query).matches, () => ssr);
}

export const useIsDesktop = () => useMedia('(min-width: 1024px)');
export const useFinePointer = () => useMedia('(pointer: fine)');

/** 是否允许动效：已挂载 && 非 reduced-motion */
export function useMotionOK() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !reduced;
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/**
 * 输出区间依赖运行时状态（是否允许动效、桌面判断、测量出的宽度……）时，用它代替数组形式的 useTransform。
 * 原因：Motion 12 会把「滚动进度 + 数组区间」交给浏览器原生 ScrollTimeline 加速，关键帧在首次挂载时固定，
 * 之后区间变化不会生效（例如 SSR 时 ok=false 被固定成 [1, 1]）。函数形式每次渲染都读取最新区间。
 */
export function useLiveTransform<T extends number | string>(value: MotionValue<number>, input: number[], output: T[]): MotionValue<T> {
  const map = transform(input, output) as (v: number) => T;
  return useTransform(value, (v: number) => map(v));
}
