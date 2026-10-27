// 全站编号导航（顶栏 / 移动目录 / 页脚 / 命令面板快速入口共用）
export type NavKey = 'games' | 'free' | 'sites' | 'tools' | 'guides' | 'check' | 'kit';
/** match：除 href 外，哪些路径也算这一项（「排障」同时覆盖问题排查与分步教程） */
export const NAV: { no: string; key: NavKey; label: string; href: string; match?: string[] }[] = [
  { no: '01', key: 'games', label: '游戏库', href: '/games/' },
  { no: '02', key: 'free', label: '免费游戏', href: '/free/' },
  { no: '03', key: 'sites', label: '资源站', href: '/resources/' },
  { no: '04', key: 'tools', label: '工具', href: '/tools/' },
  { no: '05', key: 'guides', label: '排障', href: '/fixes/', match: ['/fixes/', '/guides/'] },
  { no: '06', key: 'check', label: '能玩吗', href: '/check/' },
  { no: '07', key: 'kit', label: '装机', href: '/kit/' },
];
export type NavCounts = Partial<Record<NavKey, number>>;

export const navActive = (n: { href: string; match?: string[] }, pathname: string) => (n.match ?? [n.href]).some((h) => pathname.startsWith(h));
