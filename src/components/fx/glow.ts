/**
 * 全站暗场的统一布光：同一个深色底，游戏美术只作为一团模糊的色光（不出现形状），中心亮、四周压暗。
 * 首页的档案、免费、资源站三章与内页刊头都用它——换的是光的颜色，不是整屏背景。
 */
export const GLOW_IMG = 'absolute inset-0 size-full scale-125 object-cover blur-3xl saturate-[1.4]';
export const GLOW_VEIL = 'absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.94)_78%)]';
