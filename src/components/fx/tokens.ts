// 动效 token（V3）：全站只用这两条缓动、三档时长与一个错峰间隔。
// 组件里不要再手写 cubic-bezier 数组；CSS 侧对应 globals.css 的 --ease-expo / --ease-inout。

/** 出场与入场：快起慢收，用于元素进入、面板展开、数字落定 */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** 往返与过场：对称缓入缓出，用于章节交接、循环提示 */
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const;

export const DUR = {
  /** 悬停、按下、颜色切换 */
  micro: 0.2,
  /** 单个元素入场 */
  enter: 0.6,
  /** 章节级过场、长距离位移 */
  scene: 0.9,
} as const;

/** 同组元素逐个入场的间隔（秒） */
export const STAGGER = 0.06;

/** 常用组合：元素入场 */
export const enter = (delay = 0) => ({ duration: DUR.enter, ease: EASE_OUT, delay });
