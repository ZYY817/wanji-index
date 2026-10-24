import Link from 'next/link';
import type { Metadata } from 'next';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { Button } from '@/components/ui/button';
import { LifecycleBadge } from '@/components/ui/badge';
import { KitWindow } from '@/components/kit/kit-window';
import { KIT_FEATURES, KIT_ITEMS } from '@/lib/kit';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
export const metadata: Metadata = { title: '一键装机工具', description: '游戏运行库检测与安装工具，开发中。预览检测体验与产品计划。', alternates: { canonical: '/kit/' } };
const FAQ = [ ['现在可以下载吗？', '还不可以。工具正在开发，这里的窗口是交互演示，不会检测或修改你的设备。正式版本发布后，本页才会提供下载入口。'], ['会从哪里下载安装包？', '计划仅使用微软等原始发布方提供的官方安装程序，并在操作前列明组件与来源。'], ['能修好所有游戏报错吗？', '不能。运行库只是启动失败的一类原因。驱动、MOD 冲突、存档与游戏文件问题，仍需要结合档案中的排障教程判断。'], ['会自动修改电脑吗？', '网页演示不会修改电脑。正式工具计划在用户确认组件和安装操作后执行，并保留本地操作记录。'] ];
const KIT_GROUPS = new Set(KIT_ITEMS.map((i) => i.group)).size;

export default function KitPage() {
  return <>
    <PageMastheadFrame no="06" en="WANJI KIT / PREVIEW" crumbs={[['装机工具']]}>
      <div className="grid gap-8 pb-9 pt-8 md:grid-cols-12 md:gap-10 md:pb-12 md:pt-11">
        <div className="md:col-span-7">
          <h1 className="display-m leading-[1.05]">
            <span className="block">开机之后，</span>
            <span className="mt-1 block pl-[0.55em]">开玩之前。</span>
          </h1>
          <p className="mt-6 max-w-[40ch] text-base leading-[1.8] text-fg-2">让游戏环境准备这件事，少一点试错。一个专注运行库检测与修复的独立工具。</p>
        </div>

        <aside className="md:col-span-5">
          <div className="border border-border-strong bg-[#0E0E0D]">
            <div className="flex h-9 items-center gap-3 border-b border-border px-3">
              <span className="meta text-2xs text-fg-3"><span className="text-foreground">WANJI KIT</span> / 状态板</span>
              <span className="flex-1" />
              <LifecycleBadge value="upcoming" />
            </div>
            <dl className="divide-y divide-border text-xs">
              {[
                ['状态', '开发中 · 尚未发布'],
                ['检测清单', `${String(KIT_ITEMS.length).padStart(2, '0')} 项 · ${String(KIT_GROUPS).padStart(2, '0')} 组运行库`],
                ['安装来源', '仅微软等官方安装程序'],
                ['版本', 'v0.1'],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[64px_1fr] items-baseline gap-3 px-3 py-2">
                  <dt className="meta text-2xs text-fg-3">{k}</dt>
                  <dd className="text-fg-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
              <Button disabled variant="disabled">下载（开发中）</Button>
              <Button asChild><Link href="/guides/">先看排障教程</Link></Button>
            </div>
          </div>
          <p className="meta mt-2 text-2xs leading-[1.7] text-fg-3">产品状态板 · 网页界面为演示，不检测本机</p>
        </aside>
      </div>
    </PageMastheadFrame>
    <section className="container-x py-14 md:py-24" aria-labelledby="kit-demo-title"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="meta text-fg-3">01 / THE PREVIEW</p><h2 id="kit-demo-title" className="mt-4 font-serif text-3xl md:text-4xl">问题，先看清楚。</h2></div><p className="max-w-sm text-sm leading-7 text-fg-2">点一下，预览检测流程。以下为演示数据，不代表你当前电脑的环境。</p></div><div className="mx-auto max-w-5xl"><KitWindow interactive /></div></section>
    <section className="relative border-y border-border bg-card">
      <div className="container-x py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="meta text-fg-3">02 / BUILT FOR A CLEARER START</p>
            <h2 className="mt-5 font-serif text-5xl font-bold leading-tight md:text-6xl">少一点折腾。<br />多一点游戏。</h2>
          </div>
          <p className="max-w-md self-end text-base leading-8 text-fg-2">缺少一个 DLL，不该意味着在搜索结果里碰运气。我们希望把检测、来源与处理记录放在同一处，让每一步都知道为什么。</p>
        </div>
        <p className="meta mt-12 border-b border-border pb-4 text-fg-3">以下为产品规划，具体支持范围以正式版本为准</p>
        <div className="grid md:grid-cols-2">
          {KIT_FEATURES.map((f, i) => (
            <article key={f.no} className={`border-b border-border py-8 md:py-12 ${i % 2 === 0 ? 'md:border-r md:pr-12' : 'md:pl-12'}`}>
              <span className="font-mono text-sm text-fg-3">{f.no}</span>
              <h3 className="mt-5 font-serif text-2xl font-bold">{f.title}</h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-fg-2">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
    <section className="container-x grid gap-10 py-16 md:grid-cols-[1fr_2fr] md:py-24"><div><p className="meta text-fg-3">03 / BEFORE YOU START</p><h2 className="mt-5 font-serif text-4xl">你可能想知道。</h2></div><Accordion type="single" collapsible>{FAQ.map(([q, a], i) => <AccordionItem key={q} value={q}><AccordionTrigger index={i + 1}>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion></section>
  </>;
}
