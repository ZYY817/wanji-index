// 中英切换：页面里同时输出中英两份文字，<html data-lang> 决定显示哪一份（globals.css 里的 .l-zh / .l-en 规则）。
// 这样服务端组件、静态导出都不用改路由；切换瞬间完成，不重新加载页面。
// 语言选择存在 localStorage（wanji:lang），layout 里的 beforeInteractive 脚本在首帧前写到 <html> 上，避免闪烁。
import { Fragment, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';
export const LANG_KEY = 'wanji:lang';
export const LANG_EVENT = 'wanji:lang';

/** 双语文字：<T zh="游戏库" en="Games" />。en 缺省时两种语言都显示中文 */
export function T({ zh, en }: { zh: ReactNode; en?: ReactNode }) {
  if (en == null || en === zh) return <Fragment>{zh}</Fragment>;
  return (
    <>
      <span className="l-zh">{zh}</span>
      <span className="l-en" lang="en">{en}</span>
    </>
  );
}

/** 写成函数更顺手的地方：t('游戏库', 'Games') */
export const t = (zh: ReactNode, en?: ReactNode) => <T zh={zh} en={en} />;

/** 首帧前执行：把保存的语言写到 <html data-lang> 与 lang 属性上 */
export const LANG_BOOT = `try{var l=localStorage.getItem('${LANG_KEY}');if(l==='en'){document.documentElement.dataset.lang='en';document.documentElement.lang='en'}}catch(e){}`;
