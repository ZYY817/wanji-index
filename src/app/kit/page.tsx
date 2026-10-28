import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Download } from 'lucide-react';
import { KitHero } from '@/components/kit/kit-hero';
import { DetailSection } from '@/components/layout/detail-section';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { T } from '@/lib/i18n';
import { withBase } from '@/lib/base';
import { KIT, KIT_CATEGORIES, kitDate } from '@/lib/kit-release';

export const metadata: Metadata = {
  title: '装机工具',
  description: `玩机装机工具 v${KIT.version}：Windows 游戏运行库一键检测与安装，${KIT.catalog?.components.length ?? 32} 项检测，只走微软与官方渠道，免安装。`,
  alternates: { canonical: '/kit/' },
};

const FEATURES: { zh: [string, string]; en: [string, string] }[] = [
  { zh: ['一次体检，全部列出', 'VC++ 2005–2022、.NET Framework 与 .NET 桌面运行时、DirectX 旧组件、XNA、OpenAL、PhysX、WebView2、UE 前置组件等运行库，外加游戏模式、硬件加速调度等系统优化项。缺什么一屏看清。'],
    en: ['One scan, everything listed', 'VC++ 2005–2022, .NET Framework and .NET Desktop, legacy DirectX, XNA, OpenAL, PhysX, WebView2, UE prerequisites and more — plus system tweaks like Game Mode and HAGS. See what’s missing at a glance.'] },
  { zh: ['一键装齐，装完再验', '缺失项自动排队，只弹一次管理员授权；装完逐项重新检测——扫到才算装好，不以安装程序的返回值为准。'],
    en: ['Install it all, then verify', 'Missing items are queued with a single admin prompt; afterwards each one is re-scanned — it only counts once it’s actually detected.'] },
  { zh: ['只走官方渠道', '优先用微软的 winget，没有 winget 时用微软 / 原始发布方的官方直链兜底。不碰任何第三方打包站，不捆绑软件。'],
    en: ['Official sources only', 'winget first, with direct official links from Microsoft or the original publisher as a fallback. No repack sites, no bundled software.'] },
  { zh: ['修复模式', '已经装了、但怀疑损坏的运行库，勾上即可强制重装。'],
    en: ['Repair mode', 'Tick a runtime that’s installed but seems broken to force a reinstall.'] },
  { zh: ['装不了的也给路', '没有自动安装渠道的组件标为「需手动」，点开直达官方指引；安装失败的项在完成页给出官方下载链接。'],
    en: ['A way forward for everything', 'Components without an automatic installer are marked “manual” and link to the official instructions; anything that fails gets an official download link.'] },
  { zh: ['中英双语、免安装', '界面中文 / English 一键切换；解压即用的绿色软件，不写注册表、不留后台服务。'],
    en: ['Bilingual and portable', 'Switch between Chinese and English in one click; unzip and run — no installer, no background services.'] },
];

const SHOT_CAPTION: Record<string, [string, string]> = {
  result: ['体检结果：缺什么、多大、能不能自动装', 'Scan results: what’s missing, how big, and whether it can auto-install'],
  components: ['组件清单：32 项，按类别列出', 'Component list: 32 items by category'],
  install: ['安装中：逐项安装并重新验证', 'Installing: each item installed and re-verified'],
};

const STEPS: [string, string][] = [
  ['下载 zip，解压整个文件夹（不要只拿出 exe）', 'Download the zip and extract the whole folder (not just the exe)'],
  ['运行 runtime_check.exe，点「开始检测」——只读检测，约 10 秒，不改系统', 'Run runtime_check.exe and click Scan — it’s read-only and takes about 10 seconds'],
  ['看结果，点「一键装齐」；装运行库时 Windows 会弹一次管理员授权', 'Review the results and click Install all; Windows asks for admin permission once'],
];

const FAQ: { q: [string, string]; a: [string, string] }[] = [
  { q: ['打开时 Windows 提示「已保护你的电脑」怎么办？', 'Windows says “Windows protected your PC” — what now?'],
    a: ['这是 SmartScreen 对未做代码签名的程序的常规提示。点「更多信息」→「仍要运行」即可。源码完全公开在 GitHub，可以自行查看或从源码构建。', 'That’s SmartScreen’s standard warning for unsigned apps. Click “More info” → “Run anyway”. The source is fully public on GitHub if you want to check or build it yourself.'] },
  { q: ['会从哪里下载安装包？', 'Where do the installers come from?'],
    a: ['优先通过微软的 winget；没有 winget 的电脑用微软或原始发布方的官方直链。每个组件的检测规则和下载地址都写在公开的组件清单（catalog/runtimes.json）里。', 'winget first; on PCs without winget, direct official links from Microsoft or the original publisher. Every component’s detection rule and download URL is listed in the public catalog (catalog/runtimes.json).'] },
  { q: ['会自动改我的电脑吗？', 'Will it change my PC on its own?'],
    a: ['检测是只读的。只有你点了安装才会装运行库；系统优化项（电源计划、游戏模式等）默认可勾选跳过。所有操作写入本地日志 %APPDATA%\\WanjiKit\\logs\\。', 'Scanning is read-only. Runtimes are only installed when you click Install, and system tweaks can be skipped. Everything is logged to %APPDATA%\\WanjiKit\\logs\\.'] },
  { q: ['能修好所有游戏报错吗？', 'Will it fix every game error?'],
    a: ['不能。运行库只是启动失败的一类原因；驱动、MOD 冲突、存档与游戏文件问题，请看站内的排障页。', 'No. Missing runtimes are just one cause of launch failures; for drivers, mod conflicts, saves and game files, see the Fixes section.'] },
];

// 组件目录里有些简称本身是中文（系统优化项），英文界面用这张表
const SHORT_EN: Record<string, string> = {
  'dx-jun2010': 'DirectX 9.0c (June 2010)', ue4prereq: 'UE4 / UE5 prerequisites', 'power-high': 'High-performance power plan',
  gamemode: 'Game Mode', hags: 'Hardware-accelerated GPU scheduling', 'game-dvr-off': 'Turn off Game DVR',
  'fullscreen-opt': 'Fullscreen optimizations', 'visual-performance': 'Visual effects: best performance',
};

// 装机工具：首屏（下载）→ 能做什么 → 界面截图 → 检测清单（来自工具的组件目录）→ 下载与运行 → 常见问题
export default function KitPage() {
  const comps = KIT.catalog?.components ?? [];
  const shots = KIT.shots.filter((s) => s.name !== 'idle');

  return (
    <>
      <KitHero />

      <div className="container-x">
        <DetailSection index={0} meta={{ id: 'features', title: <T zh="它能做什么" en="What it does" /> }}>
          <ul className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="bg-background p-6 md:p-7">
                <p className="font-mono text-xs text-fg-3">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 text-xl font-semibold leading-snug"><T zh={f.zh[0]} en={f.en[0]} /></h3>
                <p className="mt-3 text-base leading-[1.75] text-fg-2"><T zh={f.zh[1]} en={f.en[1]} /></p>
              </li>
            ))}
          </ul>
        </DetailSection>

        {shots.length > 0 && (
          <DetailSection index={1} meta={{ id: 'screens', title: <T zh="界面" en="Screenshots" />, lead: <T zh="工具的真实界面，随新版本自动更新。" en="Real screens from the app, updated with each release." /> }}>
            <div className="grid gap-6 md:grid-cols-2">
              {shots.map((s, i) => (
                <figure key={s.name} className={i === 0 ? 'md:col-span-2' : ''}>
                  <div className="overflow-hidden rounded-sm ring-1 ring-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={withBase(s.src)} width={s.width} height={s.height} alt="" loading="lazy" className="block h-auto w-full" />
                  </div>
                  {SHOT_CAPTION[s.name] && <figcaption className="mt-3 text-sm text-fg-2"><T zh={SHOT_CAPTION[s.name][0]} en={SHOT_CAPTION[s.name][1]} /></figcaption>}
                </figure>
              ))}
            </div>
          </DetailSection>
        )}

        {comps.length > 0 && (
          <DetailSection index={2} meta={{ id: 'components', title: <T zh="检测清单" en="What it checks" />, count: comps.length, lead: <T zh={`来自工具公开的组件目录（第 ${KIT.catalog?.version} 版，${KIT.catalog?.updatedAt}），新增组件后这里自动更新。`} en={`From the app’s public component catalog (v${KIT.catalog?.version}, ${KIT.catalog?.updatedAt}); updates automatically when components are added.`} /> }}>
            <div className="space-y-10">
              {KIT_CATEGORIES.map((c) => {
                const list = comps.filter((x) => x.category === c.key);
                if (!list.length) return null;
                return (
                  <section key={c.key} aria-labelledby={`kc-${c.key}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border-strong pb-3">
                      <h3 id={`kc-${c.key}`} className="text-lg font-semibold"><T zh={c.zh} en={c.en} /> <span className="ml-1 font-mono text-sm font-normal text-fg-3">{list.length}</span></h3>
                      {c.fix && (
                        <Link href={`/fixes/${c.fix}/`} className="group inline-flex min-h-11 items-center gap-1.5 text-sm text-fg-2 underline decoration-primary underline-offset-[5px] hover:text-primary">
                          <T zh="相关排障" en="Related fix" />
                          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      )}
                    </div>
                    <ul className="grid gap-x-10 md:grid-cols-2">
                      {list.map((x) => (
                        <li key={x.id} className="border-b border-border py-3.5">
                          <p className="flex items-baseline justify-between gap-4">
                            <span className="text-base font-medium text-foreground"><T zh={x.name} en={SHORT_EN[x.id] ?? x.short} /></span>
                            <span className="shrink-0 font-mono text-2xs text-fg-3">
                              {x.importance === 'essential' && <span className="mr-2 text-primary"><T zh="必备" en="essential" /></span>}
                              {x.sizeMb ? `${x.sizeMb} MB` : ''}
                            </span>
                          </p>
                          <p className="mt-1 text-sm leading-[1.7] text-fg-2"><T zh={x.why} en="" /></p>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </DetailSection>
        )}

        <DetailSection index={3} meta={{ id: 'download', title: <T zh="下载与运行" en="Download & run" /> }}>
          <ol className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
            {STEPS.map(([zh, en], i) => (
              <li key={i} className="bg-background p-6 md:p-7">
                <p className="font-mono text-3xl leading-none text-primary">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-4 text-base leading-[1.75] text-foreground/90"><T zh={zh} en={en} /></p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {KIT.asset && (
              <a href={KIT.asset.url} className="inline-flex h-12 items-center gap-2.5 rounded-sm bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
                <Download aria-hidden className="size-4" />
                {KIT.asset.name}
                <span className="font-mono text-sm opacity-70">{KIT.asset.sizeMb} MB</span>
              </a>
            )}
            <a href={KIT.releaseUrl} target="_blank" rel="noopener noreferrer" className="text-base text-fg-2 underline decoration-border-strong underline-offset-[5px] hover:text-foreground">
              <T zh={`v${KIT.version} 更新说明`} en={`v${KIT.version} release notes`} />
            </a>
            <span className="font-mono text-xs text-fg-3"><T zh="发布于" en="Released" /> {kitDate(KIT.publishedAt)} · Windows 10 / 11 x64</span>
          </div>
        </DetailSection>

        <DetailSection index={4} meta={{ id: 'faq', title: <T zh="常见问题" en="FAQ" />, count: FAQ.length }}>
          <Accordion type="single" collapsible defaultValue="0" className="border-t border-border-strong">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger index={i + 1} className="text-lg"><T zh={f.q[0]} en={f.q[1]} /></AccordionTrigger>
                <AccordionContent><p className="leading-[1.8]"><T zh={f.a[0]} en={f.a[1]} /></p></AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DetailSection>
      </div>
    </>
  );
}
