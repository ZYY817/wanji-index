'use client';
import { T } from '@/lib/i18n';
import type { OfferVM } from '@/lib/present';
import { useNow } from './countdown';
import { liveLifecycle } from './use-lifecycle';

/**
 * 免费页刊头的一句话：「此刻有 N 款正在限时领取……」。
 * 静态站点不会自动重新构建，所以数字在浏览器里按当前时间重算（服务端先输出构建时的数字，挂载后校正），
 * 活动过期后不会继续显示过时的数量。
 */
export function LiveFreeSummary({ offers, build }: { offers: OfferVM[]; build: string }) {
  const now = useNow(60_000);
  const lc = (o: OfferVM) => liveLifecycle(o, now);
  const active = offers.filter((o) => o.type === 'limited' && lc(o) === 'active').length;
  const soon = offers.filter((o) => lc(o) === 'upcoming').length;
  const head = active
    ? `此刻有 ${active} 款正在限时领取${soon ? `，${soon} 款即将开始` : ''}`
    : soon ? `这一期限时领取已结束，下一期 ${soon} 款即将开始` : '这一期限时领取已结束，下一期公布后会第一时间更新';
  const headEn = active
    ? `${active} free to keep right now${soon ? `, ${soon} coming up` : ''}`
    : soon ? `This round has ended — ${soon} coming up next` : 'This round has ended — we’ll update as soon as the next is announced';
  return <T zh={`${head}，共 ${offers.length} 条免费情报。截止时间按北京时间计算，核验更新于 ${build}。`} en={`${headEn}. ${offers.length} free games in total. Times are Beijing time (UTC+8); last checked ${build}.`} />;
}
