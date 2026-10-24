'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TextCover } from './text-cover';

// 游戏美术：固定宽高比容器 + 占位底色 + 懒加载；onError 回退到文字封面（客户端组件）
export function GameArt({
  src, name, en, seed, variant = 'poster', priority, className, imgClassName, sizes,
}: {
  src?: string | null; name: string; en?: string; seed: string; variant?: 'poster' | 'wide';
  priority?: boolean; className?: string; imgClassName?: string; sizes?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;
  const ref = useRef<HTMLImageElement>(null);
  // 水合前已加载失败的图片不会再触发 onError：挂载时补查一次
  useEffect(() => {
    const img = ref.current;
    if (src && img && img.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);
  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {failed ? (
        <TextCover name={name} en={en} seed={seed} variant={variant} />
      ) : (
        <img
          ref={ref}
          src={src!}
          alt=""
          aria-hidden
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={() => setFailedSrc(src!)}
          className={cn('absolute inset-0 size-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}
