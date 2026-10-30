// 玩机索引品牌图形（对称的 W + 中间一颗独立菱形）——全站唯一来源：
//   顶栏组件（src/components/ui/brand-mark.tsx）、favicon 与各尺寸图标（scripts/gen-icons.mjs）、分享卡片（scripts/gen-og.mjs）都从这里取路径。
//
// 原始路径来自作者提供的矢量素材（画布 260×220）。这里把它放进正方形画布：
//   STANDARD 标准版：原样，用于 48px 以上（顶栏、手机图标、分享图）；
//   SMALL 小尺寸版：16 / 32px 专用——菱形缩到约 0.66 倍、两侧笔画内缘各外移 9，
//   让菱形与笔画之间的缝在 16px 下也有 1 像素以上，不会糊成字母 H。

/** 正方形 viewBox：内容区 x 20–240、y 16–196，上下居中 */
export const VIEWBOX = '20 -4 220 220';

const LEFT = 'M22 20 Q20 16 25 16 L61 16 Q66 16 68 21 L108 138 Q110 142 108 147 L93 190 Q91 196 85 196 L68 196 Q62 196 60 190 Z';
const RIGHT = 'M238 20 Q240 16 235 16 L199 16 Q194 16 192 21 L152 138 Q150 142 152 147 L167 190 Q169 196 175 196 L192 196 Q198 196 200 190 Z';
const DIAMOND = 'M130 44 Q133 44 135 48 L157 80 Q160 84 157 88 L135 117 Q130 123 125 117 L103 88 Q100 84 103 80 L125 48 Q127 44 130 44 Z';

// 小尺寸版：笔画内缘（靠近中线的那条边）外移 9，菱形绕中心缩到约 0.66（去掉圆角，小尺寸下圆角只会发虚）
const LEFT_SMALL = 'M22 20 Q20 16 25 16 L52 16 Q57 16 59 21 L99 138 Q101 142 99 147 L87 190 Q85 196 79 196 L68 196 Q62 196 60 190 Z';
const RIGHT_SMALL = 'M238 20 Q240 16 235 16 L208 16 Q203 16 201 21 L161 138 Q159 142 161 147 L173 190 Q175 196 181 196 L192 196 Q198 196 200 190 Z';
const DIAMOND_SMALL = 'M130 58.3 L147.2 82.1 L130 106.6 L112.8 82.1 Z';

export const STANDARD = [LEFT, RIGHT, DIAMOND];
export const SMALL = [LEFT_SMALL, RIGHT_SMALL, DIAMOND_SMALL];

/**
 * 生成一张图标 SVG。
 * @param opts.paths  STANDARD | SMALL
 * @param opts.fg     图形颜色
 * @param opts.bg     底板颜色（不传则透明）
 * @param opts.pad    图形四周留白（占边长比例）
 * @param opts.radius 底板圆角（占边长比例）
 */
export function iconSvg({ paths = STANDARD, fg = '#F5F5F7', bg, pad = 0.2, radius = 0.225, size = 512 } = {}) {
  const s = 220, inner = s * (1 - pad * 2), k = inner / s, off = (s - inner) / 2;
  const tile = bg ? `<rect x="20" y="-4" width="${s}" height="${s}" rx="${s * radius}" fill="${bg}"/>` : '';
  const mark = `<g transform="translate(${20 + off - 20 * k} ${-4 + off + 4 * k}) scale(${k})" fill="${fg}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${VIEWBOX}">${tile}${mark}</svg>`;
}
