'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TextCover } from './text-cover';

/**
 * 游戏美术：固定宽高比容器 + 占位底色 + 懒加载。
 * src 可以是一串候选地址（如 [竖版海报, 横幅, 胶囊图]）：前一个加载失败自动换下一个，全部失败才回退到文字封面。
 * Steam 并非每款游戏都有全部尺寸，候选链能避免「明明有美术却显示黑块」。
 */
export function GameArt({
  src, name, en, seed, variant = 'poster', priority, loading, className, imgClassName, sizes,
}: {
  src?: string | null | (string | null | undefined)[]; name: string; en?: string; seed: string; variant?: 'poster' | 'wide';
  priority?: boolean;
  /** 显式覆盖加载策略：sticky / pin 舞台里的图片要用 eager，浏览器的懒加载在吸顶容器里可能永远不触发 */
  loading?: 'eager' | 'lazy';
  className?: string; imgClassName?: string; sizes?: string;
}) {
  const list = (Array.isArray(src) ? src : [src]).filter((u): u is string => Boolean(u));
  const key = list.join('|');
  const [index, setIndex] = useState(0);
  const current = list[index];
  const ref = useRef<HTMLImageElement>(null);

  // 候选列表变化时从头开始
  useEffect(() => setIndex(0), [key]);
  // 水合前已加载失败的图片不会再触发 onError：挂载 / 切换候选时补查一次
  useEffect(() => {
    const img = ref.current;
    if (current && img && img.complete && img.naturalWidth === 0) setIndex((i) => i + 1);
  }, [current]);

  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {current ? (
        <img
          key={current}
          ref={ref}
          src={current}
          alt=""
          aria-hidden
          sizes={sizes}
          loading={loading ?? (priority ? 'eager' : 'lazy')}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={() => setIndex((i) => i + 1)}
          className={cn('absolute inset-0 size-full object-cover', imgClassName)}
        />
      ) : (
        <TextCover name={name} en={en} seed={seed} variant={variant} />
      )}
    </div>
  );
}
