'use client';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_INOUT, EASE_OUT } from '@/components/fx/tokens';

// 模块级标记：首次加载不播放转场（首页有自己的开场），之后每次站内跳转才播放
let navigated = false;

/**
 * 页面转场：站内跳转时，一条香槟金细线从左划到右，新页面同时淡入并上浮 16px。
 * template.tsx 在每次路由变化时重新挂载，所以只需要描述「进场」。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const play = navigated && !reduced;
  navigated = true;

  return (
    <>
      {play && (
        <motion.span
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[var(--header-h)] z-[60] h-px origin-left bg-primary"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ scaleX: { duration: 0.7, ease: EASE_INOUT }, opacity: { duration: 0.3, delay: 0.6 } }}
        />
      )}
      <motion.div
        initial={play ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </>
  );
}
