'use client';
import { useL } from '@/components/layout/lang-toggle';
import { T } from '@/lib/i18n';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { ArrowRight, BookOpen, CornerDownLeft, History, LifeBuoy, RotateCw, Search, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { SiteLogo, ToolLogo } from '@/components/ui/site-logo';
import { loadSearchIndex, getRecent, pushRecent, type RecentItem } from '@/lib/search-client';
import { matchItems, groupByType, type SearchItem } from '@/lib/search-match';
import { NAV } from '@/lib/nav';
import { getLenis } from './providers';
import { cn } from '@/lib/utils';

// 全局命令面板：Ctrl/⌘K、/ 唤起；数据来自 /search-index.json（withBase fetch）
const Ctx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
export const useCommand = () => useContext(Ctx);

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((v) => !v); }
      else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop(); else l?.start();
  }, [open]);
  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} setOpen={setOpen} />
    </Ctx.Provider>
  );
}

function ItemIcon({ it, size = 32 }: { it: RecentItem; size?: number }) {
  if (it.type === 'game')
    return (
      <span className="relative block h-[30px] w-[64px] shrink-0 overflow-hidden rounded-xs bg-surface-3">
        {it.art ? <img src={it.art} alt="" loading="lazy" className="size-full object-cover" onError={(e) => ((e.currentTarget.style.display = 'none'))} /> : null}
      </span>
    );
  if (it.type === 'site') return <SiteLogo id={it.seed ?? it.title} name={it.title} size={size} />;
  if (it.type === 'tool' && it.seed) return <ToolLogo id={it.seed} name={it.title} size={size} />;
  const Icon = it.type === 'tool' ? Wrench : it.type === 'problem' ? LifeBuoy : BookOpen;
  return (
    <span className="grid shrink-0 place-items-center rounded-xs border border-border-strong text-fg-2" style={{ width: size, height: size }}>
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

function Row({ it, onPick, value }: { it: RecentItem; onPick: () => void; value: string }) {
  return (
    <Command.Item
      value={value}
      onSelect={onPick}
      className="group flex min-h-14 cursor-pointer items-center gap-3 rounded-xs px-3 py-2 text-fg-2 data-[selected=true]:bg-surface-2 data-[selected=true]:text-foreground"
    >
      <ItemIcon it={it} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base text-foreground">{it.title}</span>
        {it.sub && <span className="block truncate tabular text-2xs tracking-[0.06em] text-fg-3">{it.sub}</span>}
      </span>
      <CornerDownLeft aria-hidden className="size-3.5 text-fg-3 opacity-0 group-data-[selected=true]:opacity-100" />
    </Command.Item>
  );
}

function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const l = useL();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<RecentItem[]>([]);

  const load = useCallback((force = false) => {
    setError(false);
    loadSearchIndex(force).then(setItems).catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    setRecent(getRecent());
    if (!items) load();
  }, [open, items, load]);

  const results = useMemo(() => (items && q.trim() ? matchItems(items, q) : []), [items, q]);
  const groups = useMemo(() => groupByType(results.slice(0, 40)), [results]);

  const go = (it: RecentItem) => {
    pushRecent({ type: it.type, title: it.title, sub: it.sub, url: it.url, art: it.art, seed: it.seed });
    setOpen(false);
    setQ('');
    router.push(it.url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQ(''); }}>
      <DialogContent
        className="inset-0 flex flex-col bg-popover sm:inset-auto sm:left-1/2 sm:top-[12vh] sm:max-h-[72vh] sm:w-[min(720px,calc(100vw-32px))] sm:-translate-x-1/2 sm:rounded-sm sm:border sm:border-border-strong sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)]"
        aria-describedby="cmdk-desc"
      >
        <DialogTitle className="sr-only"><T zh="搜索玩机索引" en="Search Wanji Index" /></DialogTitle>
        <DialogDescription id="cmdk-desc" className="sr-only"><T zh="输入游戏、资源站、工具或报错关键词，上下键选择，回车打开" en="Type a game, site, tool or error; use arrow keys and Enter" /></DialogDescription>
        <Command shouldFilter={false} loop label="Search" className="flex min-h-0 flex-1 flex-col">
          <div className="meta flex items-center justify-between border-b border-border px-4 py-2.5 text-fg-3">
            <span><T zh="玩机索引 / 检索" en="Wanji Index / Search" /></span>
            <span>{items ? <T zh={`${String(items.length).padStart(3, '0')} 条索引`} en={`${items.length} entries`} /> : error ? <T zh="索引未加载" en="Index not loaded" /> : <T zh="载入中…" en="Loading…" />}</span>
          </div>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search aria-hidden className="size-[18px] shrink-0 text-fg-3" />
            <Command.Input
              value={q}
              onValueChange={setQ}
              autoFocus
              placeholder={l('游戏名、资源站、工具、报错原文…', 'Game, site, tool or error text…')}
              className="h-14 min-w-0 flex-1 bg-transparent font-display text-xl font-semibold tracking-[-0.005em] text-foreground outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-fg-3"
            />
            <button type="button" onClick={() => setOpen(false)} className="touch-target -mr-1 inline-flex items-center px-1" aria-label={l('关闭', 'Close')}>
              <Kbd>ESC</Kbd>
            </button>
          </div>

          <Command.List data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:max-h-[52vh]">
            {error && (
              <div className="flex flex-col items-start gap-3 px-3 py-6">
                <p className="text-base text-fg-2"><T zh="搜索索引加载失败，可能是网络中断。" en="Couldn’t load the search index — check your connection." /></p>
                <button type="button" onClick={() => load(true)} className="inline-flex h-10 items-center gap-2 rounded-sm border border-border-strong px-3 text-sm hover:border-foreground/60">
                  <RotateCw className="size-3.5" aria-hidden /> <T zh="重试" en="Retry" />
                </button>
              </div>
            )}

            {!q.trim() && !error && (
              <>
                {recent.length > 0 && (
                  <Command.Group heading={<GroupHead icon={<History className="size-3" aria-hidden />} label={<T zh="最近访问" en="Recent" />} />}>
                    {recent.map((it) => <Row key={`r-${it.url}`} value={`r-${it.url}`} it={it} onPick={() => go(it)} />)}
                  </Command.Group>
                )}
                <Command.Group heading={<GroupHead label={<T zh="索引目录" en="Sections" />} />}>
                  {NAV.map((n) => (
                    <Command.Item
                      key={n.href}
                      value={`nav-${n.href}`}
                      onSelect={() => { setOpen(false); router.push(n.href); }}
                      className="group flex min-h-12 cursor-pointer items-center gap-4 rounded-xs px-3 text-fg-2 data-[selected=true]:bg-surface-2 data-[selected=true]:text-foreground"
                    >
                      <span className="meta w-6 text-fg-3">{n.no}</span>
                      <span className="flex-1 font-display text-lg font-semibold text-foreground">{n.label}</span>
                      <ArrowRight aria-hidden className="size-3.5 text-fg-3 opacity-0 group-data-[selected=true]:opacity-100" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}

            {q.trim() && items && results.length === 0 && (
              <div className="px-3 py-8">
                <p className="font-display text-xl font-semibold"><T zh={`没有找到「${q}」`} en={`No results for “${q}”`} /></p>
                <p className="mt-2 text-sm text-fg-2"><T zh="试试游戏英文名、别名（如「老头环」），或报错里的关键词。" en="Try the English name, a nickname, or words from the error." /></p>
              </div>
            )}

            {groups.map((g) => (
              <Command.Group key={g.type} heading={<GroupHead label={g.label} count={g.items.length} />}>
                {g.items.map((it) => <Row key={it.url} value={it.url} it={it} onPick={() => go(it)} />)}
              </Command.Group>
            ))}

            {q.trim() && results.length > 0 && (
              <Command.Item
                value="__full"
                onSelect={() => { setOpen(false); router.push(`/search/?q=${encodeURIComponent(q.trim())}`); }}
                className="mt-1 flex min-h-11 cursor-pointer items-center gap-2 rounded-xs px-3 text-sm text-fg-2 data-[selected=true]:bg-surface-2 data-[selected=true]:text-foreground"
              >
                <T zh={`在搜索页查看全部 ${results.length} 条结果`} en={`See all ${results.length} results`} /> <ArrowRight className="size-3.5" aria-hidden />
              </Command.Item>
            )}
          </Command.List>

          <div className="meta hidden items-center gap-4 border-t border-border px-4 py-2.5 text-fg-3 sm:flex">
            <span className="inline-flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> <T zh="选择" en="Select" /></span>
            <span className="inline-flex items-center gap-1.5"><Kbd>↵</Kbd> <T zh="打开" en="Open" /></span>
            <span className="inline-flex items-center gap-1.5"><Kbd>ESC</Kbd> <T zh="关闭" en="Close" /></span>
            <span className="flex-1" />
            <span><T zh="游戏 · 排障 · 资源站 · 工具 · 教程" en="Games · Fixes · Sites · Tools · Guides" /></span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function GroupHead({ label, count, icon }: { label: React.ReactNode; count?: number; icon?: React.ReactNode }) {
  return (
    <span className={cn('meta flex items-center gap-2 px-3 pb-1.5 pt-3 text-fg-3')}>
      {icon}
      {label}
      {count != null && <span className="text-fg-3/80">{String(count).padStart(2, '0')}</span>}
    </span>
  );
}
