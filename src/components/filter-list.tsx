'use client';
// 通用列表筛选（React 版，URL 参数可恢复）——games/resources/tools/guides 索引页共用
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface RowDef {
  key: string;
  q: string;            // 搜索命中串（小写拼接）
  dims: Record<string, string | string[]>; // 筛选维度值
  node: React.ReactNode;
}

export function FilterList({ rows, filters, placeholder }: {
  rows: RowDef[];
  filters: { key: string; label: string; options: { value: string; label: string }[] }[];
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [dims, setDims] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.key, params.get(f.key) ?? ''])));

  const active = useMemo(() => rows.filter((r) => {
    if (q && !r.q.includes(q.toLowerCase())) return false;
    return Object.entries(dims).every(([k, v]) => {
      if (!v) return true;
      const rv = r.dims[k];
      return Array.isArray(rv) ? rv.includes(v) : rv === v;
    });
  }), [rows, q, dims]);

  const chips = [
    ...(q ? [{ k: 'q', v: q, label: `「${q}」` }] : []),
    ...filters.filter((f) => dims[f.key]).map((f) => ({ k: f.key, v: dims[f.key], label: f.options.find((o) => o.value === dims[f.key])?.label ?? dims[f.key] })),
  ];

  // URL 同步（replaceState，不污染历史）
  useEffect(() => {
    const u = new URLSearchParams();
    if (q) u.set('q', q);
    for (const [k, v] of Object.entries(dims)) if (v) u.set(k, v);
    const qs = u.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [q, dims]);

  const clear = () => { setQ(''); setDims(Object.fromEntries(filters.map((f) => [f.key, '']))); };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2.5">
        <input className="inp min-w-[200px] flex-1" placeholder={placeholder} value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="页内搜索" />
        {filters.map((f) => (
          <select key={f.key} className="sel" value={dims[f.key]} aria-label={f.label}
            onChange={(e) => setDims((d) => ({ ...d, [f.key]: e.target.value }))}>
            <option value="">{f.label}</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {chips.length > 0 && <button className="btn-line !h-11" onClick={clear}>清除全部</button>}
      </div>
      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.k} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-amber-soft)] px-3 py-1 text-xs font-medium text-[var(--color-txt-2)] hover:text-[var(--color-bad)]"
              onClick={() => c.k === 'q' ? setQ('') : setDims((d) => ({ ...d, [c.k]: '' }))}>
              {c.label} ×
            </button>
          ))}
        </div>
      )}
      <div className="meta mb-2">共 {active.length} 条</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {active.map((r) => <div key={r.key}>{r.node}</div>)}
      </div>
      {active.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-[var(--color-txt-2)]">未找到符合条件的条目</p>
          <button className="btn-line mt-4" onClick={clear}>清除全部条件</button>
        </div>
      )}
    </div>
  );
}
