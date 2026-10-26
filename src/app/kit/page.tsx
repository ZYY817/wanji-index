import Link from 'next/link';
import type { Metadata } from 'next';
import { KitHero } from '@/components/kit/kit-hero';
import { DetailSection } from '@/components/layout/detail-section';
import { Button } from '@/components/ui/button';
import { KitWindow } from '@/components/kit/kit-window';
import { KIT_FEATURES } from '@/lib/kit';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
export const metadata: Metadata = { title: '一键装机工具', description: '游戏运行库检测与安装工具，开发中。预览检测体验与产品计划。', alternates: { canonical: '/kit/' } };

const FAQ: [string, string][] = [
  ['现在可以下载吗？', '还不可以。工具正在开发，这里的窗口是交互演示，不会检测或修改你的设备。正式版本发布后，本页才会提供下载入口。'],
  ['会从哪里下载安装包？', '计划仅使用微软等原始发布方提供的官方安装程序，并在操作前列明组件与来源。'],
  ['能修好所有游戏报错吗？', '不能。运行库只是启动失败的一类原因。驱动、MOD 冲突、存档与游戏文件问题，仍需要结合档案中的排障教程判断。'],
  ['会自动修改电脑吗？', '网页演示不会修改电脑。正式工具计划在用户确认组件和安装操作后执行，并保留本地操作记录。'],
];

// 装机工具：亮色展台首屏 → 交互预览 → 功能规划 → 常见问题 → 状态与入口
export default function KitPage() {
  return (
    <>
      <KitHero />

      <div className="container-x">
        <DetailSection index={0} meta={{ id: 'preview', title: '交互预览', lead: '点一下，预览检测流程。窗口里是演示数据，不代表你当前电脑的环境。' }}>
          <KitWindow interactive />
        </DetailSection>

        <DetailSection index={1} meta={{ id: 'features', title: '它会做什么', lead: '以下为产品规划，具体支持范围以正式版本为准。' }}>
          <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {KIT_FEATURES.map((f) => (
              <li key={f.no} className="bg-background p-6 md:p-7">
                <h3 className="text-xl font-semibold leading-snug">{f.title}</h3>
                <p className="mt-3 text-base leading-[1.75] text-fg-2">{f.desc}</p>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection index={2} meta={{ id: 'faq', title: '常见问题', count: FAQ.length }}>
          <Accordion type="single" collapsible defaultValue={FAQ[0][0]} className="border-t border-border-strong">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger index={i + 1} className="text-lg">{q}</AccordionTrigger>
                <AccordionContent><p className="leading-[1.8]">{a}</p></AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DetailSection>

        <DetailSection index={3} meta={{ id: 'status', title: '什么时候能用', lead: '正式版发布后，这里会提供下载入口与校验信息。' }}>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled variant="disabled">下载（开发中）</Button>
            <Button asChild><Link href="/guides/">先看排障教程</Link></Button>
          </div>
        </DetailSection>
      </div>
    </>
  );
}
