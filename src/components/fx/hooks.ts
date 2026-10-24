'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';

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
