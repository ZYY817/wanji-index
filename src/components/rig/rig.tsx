'use client';
import { useL } from '@/components/layout/lang-toggle';
import { T } from '@/lib/i18n';
// 「我的电脑」：本机显卡 + 内存，存在浏览器本地（不上传）。游戏档案页的判定与 /check/ 列表共用。
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Cpu, MemoryStick, ScanSearch } from 'lucide-react';
import { GPUS, gpuFromRenderer, judge, VERDICT_LABEL, VERDICT_EN, type Gpu, type Reqs, type Rig, type Verdict } from '@/lib/hardware';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const KEY = 'wanji:rig';
const EVT = 'wanji:rig';
type Stored = { gpuId?: string; gpuScore?: number; gpuName?: string; ramGb?: number };

function read(): string { try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; } }
function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb); window.addEventListener('storage', cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener('storage', cb); };
}
export function saveRig(s: Stored | null) {
  try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* 隐私模式 */ }
  window.dispatchEvent(new Event(EVT));
}

/** 当前保存的配置；服务端渲染与首帧为 null（避免水合不一致） */
export function useRig(): Rig | null {
  const raw = useSyncExternalStore(subscribe, read, () => '');
  return useMemo(() => {
    if (!raw) return null;
    try {
      const s: Stored = JSON.parse(raw);
      const gpu: Gpu | undefined = s.gpuId && s.gpuScore ? { id: s.gpuId, name: s.gpuName ?? s.gpuId, score: s.gpuScore } : undefined;
      return gpu || s.ramGb ? { gpu, ramGb: s.ramGb } : null;
    } catch { return null; }
  }, [raw]);
}

/** WebGL 报告的显卡名（Chrome / Edge 一般能拿到型号；部分浏览器出于隐私只给笼统名称） */
function detectRenderer(): string | null {
  try {
    const gl = document.createElement('canvas').getContext('webgl') as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  } catch { return null; }
}

const RAMS = [4, 8, 16, 32, 64];

/** 设置面板：自动识别显卡（可改）+ 选内存 */
export function RigPicker({ className, onDone }: { className?: string; onDone?: () => void }) {
  const l = useL();
  const rig = useRig();
  const [query, setQuery] = useState('');
  const [note, setNote] = useState<React.ReactNode>(null);
  const [gpu, setGpu] = useState<Gpu | undefined>(undefined);
  const [ram, setRam] = useState<number | undefined>(undefined);

  // 已保存的配置回填；没保存过就自动识别一次
  useEffect(() => {
    if (rig) { setGpu(rig.gpu); setRam(rig.ramGb); return; }
    const r = detectRenderer();
    const g = r ? gpuFromRenderer(r) : null;
    if (g) { setGpu(g); setNote(<T zh={`已从浏览器识别到显卡：${g.name}。不对的话在下面改。`} en={`Detected your GPU from the browser: ${g.name}. Change it below if that’s wrong.`} />); }
    else setNote(r ? <T zh={`浏览器只报告了「${r.slice(0, 60)}」，没认出具体型号，请在下面选择。`} en={`The browser only reported “${r.slice(0, 60)}” — pick your GPU below.`} /> : <T zh="浏览器没有提供显卡信息，请在下面选择。" en="The browser didn’t share GPU info — pick yours below." />);
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (mem && mem < 8) setRam(mem >= 4 ? 4 : undefined); // deviceMemory 最高只报 8，≥8 时不猜
    // 只在首次挂载时识别
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!q) return [];
    return GPUS.filter((g) => g.id.includes(q) || g.id.replace(/\s/g, '').includes(q.replace(/\s/g, ''))).slice(0, 8);
  }, [query]);

  const save = () => {
    saveRig({ gpuId: gpu?.id, gpuScore: gpu?.score, gpuName: gpu?.name, ramGb: ram });
    onDone?.();
  };

  return (
    <div className={cn('rounded-xs border border-border bg-shell p-5 md:p-6', className)}>
      {note && <p className="mb-4 flex items-start gap-2 text-sm text-fg-2"><ScanSearch aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />{note}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-foreground"><Cpu aria-hidden className="size-4 text-fg-3" /><T zh="显卡" en="Graphics card" /></p>
          <p className="mt-2 text-lg font-semibold">{gpu?.name ?? <span className="text-fg-3"><T zh="未选择" en="Not set" /></span>}</p>
          <div className="relative mt-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={l('搜索型号，如 1660、RX 580、Iris Xe', 'Search a model, e.g. 1660, RX 580, Iris Xe')}
              aria-label={l('搜索显卡型号', 'Search GPU model')}
              className="h-11 w-full rounded-sm border border-input bg-background px-3 text-base text-foreground placeholder:text-fg-3 focus-visible:outline-2 focus-visible:outline-ring"
            />
            {matches.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-sm border border-border-strong bg-popover py-1 shadow-lg">
                {matches.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => { setGpu(g); setQuery(''); }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-base hover:bg-surface-2"
                    >
                      {g.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-foreground"><MemoryStick aria-hidden className="size-4 text-fg-3" /><T zh="内存" en="RAM" /></p>
          <div role="radiogroup" aria-label="RAM" className="mt-3 flex flex-wrap gap-2">
            {RAMS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={ram === r}
                onClick={() => setRam(r)}
                className={cn(
                  'h-11 min-w-[64px] rounded-sm border px-3 font-mono text-base tabular-nums transition-colors',
                  ram === r ? 'border-primary bg-primary/10 text-primary' : 'border-border-strong text-fg-2 hover:border-foreground/60 hover:text-foreground',
                )}
              >
                {r} GB
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-fg-3"><T zh="不确定？任务管理器 → 性能 → 内存，右上角就是总大小。" en="Not sure? Task Manager → Performance → Memory shows the total in the top right." /></p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="solid" onClick={save} disabled={!gpu && !ram}><T zh="保存我的配置" en="Save my PC" /></Button>
        {rig && <Button variant="ghost" onClick={() => { saveRig(null); setGpu(undefined); setRam(undefined); }}><T zh="清除" en="Clear" /></Button>}
        <span className="text-xs text-fg-3"><T zh="只保存在这台设备的浏览器里，不会上传。" en="Saved only in this browser — never uploaded." /></span>
      </div>
    </div>
  );
}

export const VERDICT_TONE: Record<Verdict, string> = {
  smooth: 'var(--color-ok)', playable: 'var(--color-warn)', weak: 'var(--color-bad-text)', unknown: 'var(--color-ended)',
};

export function VerdictMark({ verdict, className }: { verdict: Verdict; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', className)} style={{ color: VERDICT_TONE[verdict] }}>
      <span aria-hidden className="size-2 rounded-full" style={{ background: VERDICT_TONE[verdict] }} />
      <T zh={VERDICT_LABEL[verdict]} en={VERDICT_EN[verdict]} />
    </span>
  );
}

/** 游戏档案页「配置要求」章节顶部：我的电脑能不能玩 */
export function RigVerdict({ reqs }: { reqs?: Reqs }) {
  const rig = useRig();
  const [editing, setEditing] = useState(false);
  if (!reqs) return null;

  if (!rig || editing) {
    return (
      <div className="mb-6">
        {!rig && (
          <p className="mb-3 text-base text-fg-2">
            <T zh={<><span className="font-semibold text-foreground">我的电脑能玩吗？</span>设置一次显卡和内存，之后每款游戏都会直接告诉你。</>} en={<><span className="font-semibold text-foreground">Can my PC run it? </span>Set your GPU and RAM once and every game page will tell you.</>} />
          </p>
        )}
        <RigPicker onDone={() => setEditing(false)} />
      </div>
    );
  }

  const { verdict, reason, reasonEn } = judge(rig, reqs);
  const need = (verdict === 'smooth' ? reqs.rec : reqs.min ?? reqs.rec)?.gpu?.names;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xs border border-border bg-shell p-5 md:p-6">
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm text-fg-3"><T zh="你的电脑" en="Your PC" /></span>
          <VerdictMark verdict={verdict} className="text-lg" />
          <span className="text-base text-foreground"><T zh={reason} en={reasonEn} /></span>
        </p>
        <p className="mt-1.5 text-sm text-fg-2">
          {rig.gpu?.name}{rig.gpu && rig.ramGb ? ' · ' : ''}{rig.ramGb ? <T zh={`${rig.ramGb} GB 内存`} en={`${rig.ramGb} GB RAM`} /> : null}
          {need && need.length > 0 && <span className="text-fg-3"> ｜ <T zh={`要求显卡：${need.slice(0, 3).join(' / ')} 或同级`} en={`Needs: ${need.slice(0, 3).join(' / ')} or similar`} /></span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><T zh="改配置" en="Edit" /></Button>
        <Button variant="outline" size="sm" asChild><Link href="/check/"><T zh="我能玩哪些游戏" en="What can I play?" /></Link></Button>
      </div>
    </div>
  );
}
