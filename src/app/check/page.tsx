import { T } from '@/lib/i18n';
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
        title={<T zh="我的电脑能玩吗" en="Can my PC run it?" />}
        crumbs={[[<T key="c" zh="能玩吗" en="Can I run" />]]}
        description={<T zh={<>选好你的显卡和内存配置，<MastNum>{games.length}</MastNum> 款游戏就会自动按官方要求逐一对照：到底能高画质流畅跑、需要降特效，还是会比较吃力，心里有数再入手。</>} en={<>Pick your GPU and RAM once to see how <MastNum>{games.length}</MastNum> games measure up against official specs: smooth, playable with lowered settings, or struggling.</>} />}
      />
      <div className="container-x">
        <DetailSection index={0} meta={{ id: 'list', title: <T zh="对照结果" en="Results" />, lead: <T zh="点击卡片可以展开查看官方公布的完整最低与推荐配置清单。" en="Click any game to inspect its full minimum and recommended hardware specs." /> }}>
          <CheckList games={games} />
        </DetailSection>
        <DetailSection index={1} meta={{ id: 'how', title: <T zh="怎么判断的" en="How it works" /> }}>
          <div className="prose-doc max-w-[62ch] text-foreground/90">
            <ul className="list-disc space-y-2 pl-5">
              <li><T zh={<><strong>流畅</strong>：显卡和内存都达到推荐配置；<strong>能玩</strong>：达到最低配置，画质需要调低；<strong>吃力</strong>：低于最低配置。</>} en={<><strong>Smooth</strong>: GPU and RAM meet the recommended specs. <strong>Playable</strong>: meets the minimum — lower the settings. <strong>Struggles</strong>: below the minimum.</>} /></li>
              <li><T zh="显卡按公开跑分换算成相对性能分（GTX 1060 = 100），要求里列了几块显卡时，达到其中最弱那块即可；留 5% 余量。" en="GPUs are scored from public benchmarks (GTX 1060 = 100). When several cards are listed, matching the weakest is enough, with a 5% margin." /></li>
              <li><T zh="处理器、硬盘空间和系统版本暂不参与判断。结果是估算，以游戏实际表现为准。" en="CPU, disk space and OS version aren’t checked yet. Results are estimates." /></li>
              <li><T zh="显卡型号来自浏览器报告的信息；识别不准时可以手动选择。配置只保存在你的浏览器里。" en="The GPU comes from what your browser reports; pick it manually if it’s wrong. Your setup stays in your browser." /></li>
            </ul>
          </div>
        </DetailSection>
      </div>
    </>
  );
}
