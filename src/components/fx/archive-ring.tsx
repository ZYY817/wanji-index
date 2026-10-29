'use client';
import { motion, type MotionValue } from 'motion/react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * 「档案之环」矢量版：全站签名物件的占位实现（磨砂玻璃环 + 香槟金轨道 + 金球）。
 * 设计稿的 AI 渲染图（public/art/ring-*.png）到位后，可在使用处换成图片；构图与动效参数保持不变。
 * rotate / tilt 传入 MotionValue 即可随滚动转动；纯 SVG，没有位图，任意尺寸清晰。
 */
export function ArchiveRing({ rotate, tilt, tone = 'dark', className }: { rotate?: MotionValue<number>; tilt?: MotionValue<number>; tone?: 'dark' | 'light'; className?: string }) {
  const id = useId().replace(/:/g, '');
  // light：亮色展台上用深一些的玻璃边与阴影色，保证在暖白背景上依然有体积
  const c = tone === 'light'
    ? { hi: '#FFFFFF', mid: '#B0B0B5', edge: '#6E6E73', glassHi: 0.95, glassMid: 0.25 }
    : { hi: '#FFFFFF', mid: '#FFFFFF', edge: '#FFFFFF', glassHi: 0.55, glassMid: 0.08 };
  return (
    <motion.div aria-hidden className={cn('[perspective:1600px]', className)}>
      <motion.svg viewBox="0 0 600 600" className="size-full overflow-visible" style={{ rotateX: tilt, rotate }}>
        <defs>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c.hi} stopOpacity={c.glassHi} />
            <stop offset="0.35" stopColor={c.mid} stopOpacity={c.glassMid} />
            <stop offset="0.65" stopColor={c.mid} stopOpacity={c.glassMid / 2} />
            <stop offset="1" stopColor="#F5F5F7" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={c.edge} stopOpacity="0.7" />
            <stop offset="0.5" stopColor={c.edge} stopOpacity="0.05" />
            <stop offset="1" stopColor={c.edge} stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id={`${id}-orb`} cx="0.35" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.45" stopColor="#F5F5F7" />
            <stop offset="1" stopColor="#3A3A3C" />
          </radialGradient>
        </defs>
        {/* 玻璃环：粗描边 + 内外高光 */}
        <circle cx="300" cy="300" r="210" fill="none" stroke={`url(#${id}-glass)`} strokeWidth="46" />
        <circle cx="300" cy="300" r="233" fill="none" stroke={`url(#${id}-edge)`} strokeWidth="1.2" />
        <circle cx="300" cy="300" r="187" fill="none" stroke={`url(#${id}-edge)`} strokeWidth="1" opacity="0.7" />
        {/* 香槟金轨道 + 金球 */}
        <ellipse cx="300" cy="300" rx="285" ry="120" fill="none" stroke="#F5F5F7" strokeOpacity="0.75" strokeWidth="1.2" transform="rotate(-24 300 300)" />
        <ellipse cx="300" cy="300" rx="262" ry="262" fill="none" stroke="#F5F5F7" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 7" />
        <circle cx="548" cy="186" r="9" fill={`url(#${id}-orb)`} />
      </motion.svg>
    </motion.div>
  );
}
