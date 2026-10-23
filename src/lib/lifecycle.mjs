// 免费活动生命周期——纯函数，无 Node.js 专属 API
// 同一文件被构建期与浏览器端引用（docs/06 §9.2 唯一逻辑源）
// 判定表严格对应 docs/04 §4.5；时区固定 Asia/Shanghai(+08:00)
// M0a 已验证（16/16 用例）

function toMs(str, isEnd) {
  if (!str || typeof str !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str))
    return Date.parse(str + (isEnd ? 'T23:59:59' : 'T00:00:00') + '+08:00');
  const t = Date.parse(str);
  return Number.isNaN(t) ? null : t;
}

const LIFECYCLE_TYPES = new Set(['limited', 'weekend']);

export function computeLifecycle(offer, now, staleDays = 14) {
  const applicable =
    LIFECYCLE_TYPES.has(offer.type) ||
    (offer.type === 'trial' && (offer.startDate || offer.endDate));
  if (!applicable) return null;

  const hasStart = offer.startDate != null, hasEnd = offer.endDate != null;
  const s = toMs(offer.startDate, false), e = toMs(offer.endDate, true);
  if ((hasStart && s === null) || (hasEnd && e === null)) return 'uncertain';
  if (hasStart && hasEnd && s > e) return 'uncertain';

  if (hasEnd && now > e) return 'ended';
  if (hasStart && now < s) return 'upcoming';
  const c = toMs(offer.checkedAt, false);
  if (c !== null && now > c + staleDays * 864e5) return 'uncertain';
  if (!hasEnd) return 'deadline_unknown';
  return 'active';
}
