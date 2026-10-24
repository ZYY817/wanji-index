'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// 游戏官方透明 Logo（Steam logo.png）；缺失或加载失败时不渲染
export function GameLogo({ src, className }: { src?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('block', className)}
    />
  );
}
