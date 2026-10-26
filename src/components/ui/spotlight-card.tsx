'use client';

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li' | 'section';
  spotlightColor?: string;
  spotlightSize?: number;
}

/**
 * 顶级物理探针微光卡片（SpotlightCard）
 * 对标 Apple / Linear / Raycast 硬件工业质感：
 * 1. 彻底移除鼠标上的跟随圆圈，保留 100% 纯净、原生的系统最高响应度；
 * 2. 鼠标滑过时，卡片暗调表面与半透切角边框呈现极细腻的局部物理反射（Radial Spotlight）；
 * 3. 移开鼠标后自然消隐，纯硬件加速，零算力浪费与重绘抖动。
 */
export function SpotlightCard({
  children,
  className,
  as: Component = 'div',
  spotlightColor = 'rgba(255, 255, 255, 0.05)',
  spotlightSize = 360,
  ...props
}: SpotlightCardProps) {
  const elRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!elRef.current) return;
    const rect = elRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <Component
      ref={elRef as any}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden group', className)}
      {...props}
    >
      {/* 物理探针微光层：随鼠标在卡片内移动，照亮暗调表面与发丝线边框 */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 ease-out z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-[1] flex h-full w-full flex-col">{children}</div>
    </Component>
  );
}
