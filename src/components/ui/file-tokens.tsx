/**
 * 把标题里的文件名（d3dx9_43.dll、MSVCP140.dll、xxx.exe）标成等宽、不换行：
 * 报错类教程的标题就是用户搜索的原文，文件名必须完整、可辨认。
 */
const FILE = /([\w.-]+\.(?:dll|exe))/gi;

export function fileTokens(text: string): React.ReactNode {
  const parts = text.split(FILE);
  if (parts.length === 1) return text;
  return parts.map((p, i) => (i % 2 ? <code key={i} className="whitespace-nowrap font-mono text-[0.88em] font-semibold">{p}</code> : p));
}
