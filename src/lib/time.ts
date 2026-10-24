// 时间展示（Asia/Shanghai 固定时区，与 lifecycle.mjs 口径一致）
const fmt = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

/** 1761750000000 → "10.29 23:00" */
export function shDateTime(ms: number) {
  const p = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${p.month}.${p.day} ${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
}

export function splitDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
