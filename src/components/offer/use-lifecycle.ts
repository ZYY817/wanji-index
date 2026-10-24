'use client';
import { computeLifecycle } from '@/lib/lifecycle.mjs';
import type { OfferVM } from '@/lib/present';
import site from '../../../config/site.json';

/** 静态站点会过期：SSR 用构建期生命周期，挂载后按当前时间用同一纯函数重算 */
export function liveLifecycle(o: OfferVM, now: number | null): string | null {
  if (now == null) return o.lifecycle;
  return computeLifecycle({ type: o.type, startDate: o.startDate, endDate: o.endDate, checkedAt: o.checkedAt }, now, site.review.staleDays.offerTimed);
}

/** 紧迫：进行中且 72 小时内截止 */
export function isUrgent(o: OfferVM, lc: string | null, now: number | null) {
  return lc === 'active' && o.endMs != null && now != null && o.endMs - now < 72 * 3600e3;
}
