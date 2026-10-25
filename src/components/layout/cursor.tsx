'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useFinePointer } from '@/components/fx/hooks';

/**
 * 跟随光标：系统光标保留（可用性优先），外加一个随弹簧跟随的小圆点。
 *   悬停链接 / 按钮：圆点放大成空心圆；
 *   悬停带 data-cursor="文字" 的元素：变成实心圆标并显示文字（如「查看」）。
 * 只在鼠标设备、未开启 reduced-motion 时出现。
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [mode, setMode] = useState<'dot' | 'ring' | 'label'>('dot');
  const [label, setLabel] = useState('');
  const [shown, setShown] = useState(false);
  const on = fine && !reduced;

  useEffect(() => {
    if (!on) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setShown(true);
      const t = e.target as HTMLElement | null;
      const tagged = t?.closest<HTMLElement>('[data-cursor]');
      if (tagged) { setMode('label'); setLabel(tagged.dataset.cursor ?? ''); return; }
      setMode(t?.closest('a, button, [role="button"]') ? 'ring' : 'dot');
    };
    const leave = () => setShown(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [on, x, y]);

  if (!on) return null;
  const size = mode === 'label' ? 76 : mode === 'ring' ? 36 : 8;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: sx, y: sy, opacity: shown ? 1 : 0 }}
    >
      <motion.div
        className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-medium ${mode === 'label' ? '' : 'mix-blend-difference'}`}
        animate={{
          width: size,
          height: size,
          backgroundColor: mode === 'ring' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,1)',
          borderWidth: mode === 'ring' ? 1 : 0,
        }}
        style={{ borderColor: 'rgba(255,255,255,0.9)', borderStyle: 'solid' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {mode === 'label' && <span className="text-[#131211]">{label}</span>}
      </motion.div>
    </motion.div>
  );
}
