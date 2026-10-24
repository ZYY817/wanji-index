// 字母头像：确定性色相（FNV-1a 哈希）+ 首字（母）。服务端与客户端共用，同一 id 永远同一颜色。
export function hashHue(seed: string) {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

export function monogramChar(name: string) {
  const first = [...name.trim()][0] ?? '?';
  return /[a-z]/i.test(first) ? first.toUpperCase() : first;
}

/** 同明度同彩度的 OKLCH 三色：底 / 线 / 字 —— 保证任意色相下观感一致 */
export function monogramColors(seed: string) {
  const h = hashHue(seed);
  return {
    hue: h,
    bg: `oklch(0.29 0.055 ${h})`,
    line: `oklch(0.40 0.07 ${h})`,
    fg: `oklch(0.90 0.08 ${h})`,
    tint: `oklch(0.29 0.055 ${h} / 0.35)`,
  };
}
