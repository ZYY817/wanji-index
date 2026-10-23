// /kit/ —— 「一键式游戏库工具」独立介绍页（软件独立开发，本页为产品门面）
import type { Metadata } from 'next';
import { OutlineButton } from '@/components/buttons';
import { LifecycleBadge } from '@/components/badges';
import { FadeIn } from '@/components/motion';
import { SearchCheck, Zap, ShieldCheck, ClipboardList } from 'lucide-react';

export const metadata: Metadata = { title: '一键装机工具', description: '游戏运行库一键检测与安装工具（开发中）', alternates: { canonical: '/kit/' } };

const FEATURES = [
  { Icon: SearchCheck, title: '环境检测', desc: '扫描系统缺失的 VC++ Redistributable、DirectX、.NET 等游戏运行组件' },
  { Icon: Zap, title: '一键装齐', desc: '对照目标游戏需求，一键安装所需运行库，不用逐个找安装包' },
  { Icon: ShieldCheck, title: '干净可信', desc: '所有组件只从微软/官方源获取，不捆绑、不推广、不静默安装' },
  { Icon: ClipboardList, title: '可验证', desc: '安装前后给出明细清单，做了什么改动一目了然' },
];

export default function KitPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--color-line-0)]">
        <div className="pointer-events-none absolute -top-32 right-1/4 h-[380px] w-[560px] rounded-full opacity-[0.14] blur-[100px]" style={{ background: 'radial-gradient(closest-side, var(--color-amber), transparent)' }} />
        <div className="wrap-doc relative py-16 md:py-20 text-center">
          <LifecycleBadge state="upcoming" />
          <h1 className="mt-4 text-4xl font-black tracking-[-0.02em] md:text-5xl">一键装机工具</h1>
          <p className="mx-auto mt-4 max-w-[34em] text-[var(--color-txt-2)]">
            游戏打不开、缺组件、报错一堆？检测你的系统缺哪些运行库，一键装齐——干净、免费、可验证。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="btn-acq opacity-60 pointer-events-none">下载（开发中）</span>
            <OutlineButton href="/guides/launch-crash-check/" label="先看排查指南" />
          </div>
        </div>
      </section>

      <section className="wrap-doc py-12">
        <div className="sect"><h2>它做什么</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={0.06 * i}>
              <div className="card p-5">
                <f.Icon size={24} className="text-[var(--color-amber-hi)]" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="meta mt-1.5">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="wrap-doc pb-16">
        <div className="sect"><h2>为什么要做它</h2></div>
        <div className="space-y-3 text-[var(--color-txt-2)]">
          <p>市面上有 DirectX Repair 这类工具，但它们要么年久失修、要么捆绑推广。玩家需要的是：<strong>打开 → 检测 → 装好</strong>，仅此而已。</p>
          <p>这个工具会与本站联动：游戏档案页会告诉你缺什么组件，工具帮你装。先做最小可用版本验证需求。</p>
        </div>
        <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line-0)] bg-[var(--color-ink-1)] p-6 text-center">
          <p className="font-semibold">开发中，上线会在此页发布。</p>
          <p className="meta mt-2">想第一时间知道？<a href="/about/#feedback" className="text-[var(--color-amber-hi)]">留个言</a>或关注项目仓库。</p>
        </div>
      </section>
    </div>
  );
}
