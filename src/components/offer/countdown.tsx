'use client';
import { useEffect, useState } from 'react';
import { shDateTime, splitDuration, pad2 } from '@/lib/time';
import { cn } from '@/lib/utils';

/** 每秒刷新的当前时间（SSR 为 null，避免水合不一致）；enabled=false 时不额外挂计时器 */
export function useNow(interval = 1000, enabled = true) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval, enabled]);
  return now;
}

type CountdownVariant = 'default' | 'film' | 'clock' | 'dial';

/**
 * 倒计时：SSR 输出「截止 10.29 23:00」静态文本；挂载后变为 天:时:分:秒 实时倒计时。
 * - film：雷达胶片卡用，四个粗分组 + 发丝分隔
 * - clock：雷达盘心用，冒号形制
 * now 由外部传入时不再自建计时器（雷达章共用同一秒钟）。
 */
export function Countdown({
  target, mode = 'end', size = 'lg', className, now: nowProp, variant = 'default', labelClassName, fallbackClassName,
}: {
  target: number;
  mode?: 'end' | 'start';
  size?: 'lg' | 'sm';
  className?: string;
  now?: number | null;
  variant?: CountdownVariant;
  labelClassName?: string;
  fallbackClassName?: string;
}) {
  const internalNow = useNow(1000, nowProp === undefined);
  const now = nowProp === undefined ? internalNow : nowProp;
  const label = mode === 'end' ? '截止' : '开始';
  if (now == null)
    return <span className={cn('font-mono tabular-nums', fallbackClassName ?? className)}>{label} {shDateTime(target)}</span>;
  const left = target - now;
  if (left <= 0) return <span className={cn('font-mono tabular-nums', className)}>{mode === 'end' ? '已截止' : '已开始'}</span>;
  const t = splitDuration(left);
  if (size === 'sm')
    return (
      <span className={cn('font-mono tabular-nums', className)}>
        {mode === 'end' ? '剩' : '距开始'} {t.d > 0 && `${t.d}天 `}{pad2(t.h)}:{pad2(t.m)}:{pad2(t.s)}
      </span>
    );

  const groups: [string, number][] = [['天', t.d], ['时', t.h], ['分', t.m], ['秒', t.s]];
  const readyLabel = `${mode === 'end' ? '剩余' : '距开始'} ${t.d} 天 ${t.h} 小时 ${t.m} 分 ${t.s} 秒`;

  if (variant === 'film')
    return (
      <span
        role="timer"
        aria-label={readyLabel}
        className={cn('inline-flex items-start font-mono tabular-nums leading-none', className)}
      >
        {groups.map(([u, v], i) => (
          <span key={u} className="inline-flex items-start">
            {i > 0 && (
              <span aria-hidden className="mx-[0.16em] mt-[0.34em] h-[0.56em] w-px shrink-0 bg-current opacity-20" />
            )}
            <span className="flex flex-col items-center">
              <span>{pad2(v)}</span>
              <span
                aria-hidden
                className={cn('mt-2 font-sans text-2xs font-normal leading-none tracking-[0.18em] opacity-60', labelClassName)}
              >
                {u}
              </span>
            </span>
          </span>
        ))}
      </span>
    );

  if (variant === 'clock')
    return (
      <span
        role="timer"
        aria-label={readyLabel}
        className={cn('inline-flex items-start font-mono tabular-nums leading-none', className)}
      >
        {groups.map(([u, v], i) => (
          <span key={u} className="inline-flex items-start">
            {i > 0 && (
              <span aria-hidden className="mx-[0.13em] mt-[0.12em] flex h-[0.84em] flex-col justify-center gap-[0.16em]">
                <span className="size-[0.09em] bg-current opacity-55" />
                <span className="size-[0.09em] bg-current opacity-55" />
              </span>
            )}
            <span className="flex flex-col items-center">
              <span>{pad2(v)}</span>
              <span
                aria-hidden
                className={cn('mt-2 font-sans text-2xs font-normal leading-none tracking-[0.2em] opacity-55', labelClassName)}
              >
                {u}
              </span>
            </span>
          </span>
        ))}
      </span>
    );

  // 雷达盘心：只放三组，字号可以放大到 80–90px 而不溢出盘面。
  // 超过 1 天读「天:时:分」，不足 1 天读「时:分:秒」——和胶片卡同一读法，不再把天数藏成小字。
  if (variant === 'dial') {
    const dial: [string, number][] = t.d > 0 ? [['天', Math.min(t.d, 99)], ['时', t.h], ['分', t.m]] : [['时', t.h], ['分', t.m], ['秒', t.s]];
    return (
      <span
        role="timer"
        aria-label={readyLabel}
        className={cn('inline-flex items-start font-mono tabular-nums leading-none', className)}
      >
        {dial.map(([u, v], i) => (
          <span key={u} className="inline-flex items-start">
            {i > 0 && (
              <span aria-hidden className="mx-[0.1em] mt-[0.1em] flex h-[0.82em] flex-col justify-center gap-[0.16em]">
                <span className="size-[0.08em] bg-current opacity-55" />
                <span className="size-[0.08em] bg-current opacity-55" />
              </span>
            )}
            <span className="flex flex-col items-center">
              <span>{pad2(v)}</span>
              <span
                aria-hidden
                className={cn('mt-2 font-sans text-xs font-normal leading-none tracking-[0.2em] opacity-60', labelClassName)}
              >
                {u}
              </span>
            </span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-start gap-[0.18em] font-mono tabular-nums', className)} role="timer" aria-label={readyLabel}>
      {groups.map(([u, v], i) => (
        <span key={u} className="inline-flex items-start">
          {i > 0 && <span aria-hidden className="mr-[0.18em] opacity-40">:</span>}
          <span className="flex flex-col items-center">
            <span>{pad2(v)}</span>
            <span aria-hidden className={cn('mt-1 font-sans text-2xs font-normal tracking-normal opacity-60', labelClassName)}>{u}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
