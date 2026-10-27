import type { Metadata } from 'next';
import { IndexMasthead, MastNum } from '@/components/layout/page-masthead';
import { DetailSection } from '@/components/layout/detail-section';
import { CheckList, type CheckGame } from '@/components/rig/check-list';
import { loadData, steamArt } from '@/lib/data.mjs';
import { parseReqs } from '@/lib/hardware';

export const metadata: Metadata = {
  title: '我的电脑能玩吗',
  description: '设置一次显卡和内存，按 Steam 公布的配置要求，看看收录的游戏哪些能流畅运行、哪些需要调低画质。',
  alternates: { canonical: '/check/' },
};

// 配置对照：刊头 → 设置面板 / 全部游戏的判定 → 判定方法说明
export default function CheckPage() {
  const data = loadData();
  const games: CheckGame[] = data.games
    .map((g: any) => ({ id: g.id, slug: g.slug, name: g.name.zh, en: g.name.en, art: steamArt(g)?.header, reqs: parseReqs(g.requirements) }))
    .filter((g: CheckGame) => g.reqs);
  return (
    <>
      <IndexMasthead
        title="我的电脑能玩吗"
        crumbs={[['能玩吗']]}
        description={<>设置一次显卡和内存，<MastNum>{games.length}</MastNum> 款游戏按 Steam 公布的配置要求逐一对照：流畅、能玩，还是吃力。</>}
      />
      <div className="container-x">
        <DetailSection index={0} meta={{ id: 'list', title: '对照结果', lead: '点进任意一款，可以看到完整的最低 / 推荐配置。' }}>
          <CheckList games={games} />
        </DetailSection>
        <DetailSection index={1} meta={{ id: 'how', title: '怎么判断的' }}>
          <div className="prose-doc max-w-[62ch] text-foreground/90">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>流畅</strong>：显卡和内存都达到推荐配置；<strong>能玩</strong>：达到最低配置，画质需要调低；<strong>吃力</strong>：低于最低配置。</li>
              <li>显卡按公开跑分换算成相对性能分（GTX 1060 = 100），要求里列了几块显卡时，达到其中最弱那块即可；留 5% 余量。</li>
              <li>处理器、硬盘空间和系统版本暂不参与判断。结果是估算，以游戏实际表现为准。</li>
              <li>显卡型号来自浏览器报告的信息；识别不准时可以手动选择。配置只保存在你的浏览器里。</li>
            </ul>
          </div>
        </DetailSection>
      </div>
    </>
  );
}
