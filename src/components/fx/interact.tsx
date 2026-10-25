'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import { useFinePointer } from './hooks';
import { DUR, EASE_OUT } from './tokens';

const EASE_CSS = `cubic-bezier(${EASE_OUT.join(',')})`;

/** 只有精确指针（鼠标）且未开启 reduced-motion 时，鼠标类交互才生效 */
function usePointerFx() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return fine && !reduced;
}

/**
 * 磁吸：鼠标进入元素外扩 radius 的范围时，元素朝鼠标方向偏移，最多 strength px；离开后弹簧回位。
 * 用在主按钮、搜索框这类「希望被点」的元素上，不要用在大面积区块。
 */
export function Magnetic({ children, strength = 8, radius = 80, className }: { children: React.ReactNode; strength?: number; radius?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = usePointerFx();
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    if (!on) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const reach = Math.max(r.width, r.height) / 2 + radius;
      const d = Math.hypot(dx, dy);
      if (d > reach) { x.set(0); y.set(0); return; }
      const k = (1 - d / reach) * strength;
      x.set((dx / (d || 1)) * k);
      y.set((dy / (d || 1)) * k);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [on, radius, strength, x, y]);

  return <motion.div ref={ref} className={cn('will-change-transform', className)} style={{ x, y }}>{children}</motion.div>;
}

/**
 * 倾斜卡片：随鼠标做 ≤ max 度的 3D 倾斜，并有一道跟随鼠标的柔和高光（暖白，低透明度）。
 * 子元素保持可点击；高光层 pointer-events-none。
 */
export function Tilt({ children, max = 6, glare = true, className }: { children: React.ReactNode; max?: number; glare?: boolean; className?: string }) {
  const on = usePointerFx();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 20, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 180, damping: 20, mass: 0.5 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,244,224,0.16), transparent 55%)`;
  const [hover, setHover] = useState(false);

  return (
    <div
      className={cn('[perspective:1200px]', className)}
      onPointerMove={(e) => {
        if (!on) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerEnter={() => on && setHover(true)}
      onPointerLeave={() => { px.set(0.5); py.set(0.5); setHover(false); }}
    >
      <motion.div className="relative h-full rounded-[inherit] [transform-style:preserve-3d]" style={on ? { rotateX, rotateY } : undefined}>
        {children}
        {glare && on && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{ backgroundImage: light, opacity: hover ? 1 : 0 }}
          />
        )}
      </motion.div>
    </div>
  );
}

/**
 * 图片揭开：进入视口时，遮罩从下往上打开（clip-path），同时图片从 1.1 缩放到 1。
 * 约束同 Reveal：SSR / 首帧可见；只有挂载时仍在视口下方的元素才会装填为初始态。
 */
export function ClipReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [state, setState] = useState<'idle' | 'armed' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState('armed');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setState('shown'); io.disconnect(); }
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const t = state === 'shown' ? `${DUR.scene}s ${EASE_CSS} ${delay}s` : '0s';
  return (
    <div
      ref={ref}
      className={cn('overflow-hidden', className)}
      style={{ clipPath: state === 'armed' ? 'inset(100% 0 0 0)' : 'inset(0 0 0 0)', transition: `clip-path ${t}` }}
    >
      <div className="h-full w-full" style={{ transform: state === 'armed' ? 'scale(1.1)' : 'none', transition: `transform ${state === 'shown' ? `1.2s ${EASE_CSS} ${delay}s` : '0s'}` }}>
        {children}
      </div>
    </div>
  );
}
