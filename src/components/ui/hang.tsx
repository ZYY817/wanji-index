/**
 * 行尾标点的居中校正：全角「，。、！？：；」的字形只占左半格，右半格是空白。居中的标题若以它结尾，
 * 整行墨迹会向左偏 1/4 字宽（大标题上约 30–40px）。这里把整行向右平移 0.25em——只是视觉平移，
 * 不改变排版宽度，所以不会引起换行变化。只用于居中的单行标题。
 */
const END = /[，。、！？：；]$/;

export function hang(text: string): React.ReactNode {
  if (!END.test(text)) return text;
  return <span className="relative left-[0.25em]">{text}</span>;
}
