'use client';
// 顶栏的「中 / EN」切换。语言状态挂在 <html data-lang> 上，客户端组件需要按语言取属性值（placeholder、aria-label）时用 useLang()。
import { useSyncExternalStore } from 'react';
import { LANG_EVENT, LANG_KEY, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

function subscribe(cb: () => void) {
  window.addEventListener(LANG_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener(LANG_EVENT, cb); window.removeEventListener('storage', cb); };
}
const read = (): Lang => (document.documentElement.dataset.lang === 'en' ? 'en' : 'zh');

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => 'zh');
}

/** 客户端组件里取单语字符串：useL()('搜索', 'Search') */
export function useL() {
  const lang = useLang();
  return (zh: string, en?: string) => (lang === 'en' && en ? en : zh);
}

export function setLang(lang: Lang) {
  const root = document.documentElement;
  if (lang === 'en') { root.dataset.lang = 'en'; root.lang = 'en'; } else { delete root.dataset.lang; root.lang = 'zh-CN'; }
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* 隐私模式 */ }
  window.dispatchEvent(new Event(LANG_EVENT));
}

export function LangToggle({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <div role="group" aria-label="语言 / Language" className={cn('flex h-8 items-center rounded-full bg-white/[0.08] p-0.5 text-xs', className)}>
      {(['zh', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cn(
            'h-full min-w-8 rounded-full px-2 font-medium transition-colors',
            lang === l ? 'bg-white/[0.16] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.3)]' : 'text-fg-2 hover:text-foreground',
          )}
        >
          {l === 'zh' ? '中' : 'EN'}
        </button>
      ))}
    </div>
  );
}
