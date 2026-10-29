import { Globe, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zh, en } from '@/lib/labels.mjs';
import { L } from '@/lib/labels-i18n';
import { PLATFORM_PATHS } from './platform-icons';

// 平台标识（V10）：单色平台图标（随文字颜色），没有对应图标的平台用中性图形（官网 = 地球，其他 = 商店）。
// 不再用「ST / EP」这种方框字母——那看起来像假 logo。
export function PlatformMark({ platform, className, withLabel }: { platform: string; className?: string; withLabel?: boolean }) {
  const path = PLATFORM_PATHS[platform];
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={`${zh('platform', platform)} / ${en('platform', platform)}`}>
      {path ? (
        <svg aria-hidden viewBox="0 0 24 24" className="size-[1.05em] shrink-0 fill-current opacity-90"><path d={path} /></svg>
      ) : platform === 'official' ? (
        <Globe aria-hidden className="size-[1.05em] shrink-0 opacity-90" strokeWidth={1.75} />
      ) : (
        <Store aria-hidden className="size-[1.05em] shrink-0 opacity-90" strokeWidth={1.75} />
      )}
      {withLabel ? <span>{L('platform', platform)}</span> : <span className="sr-only">{L('platform', platform)}</span>}
    </span>
  );
}
