// 全站编号导航（顶栏 / 移动目录 / 页脚 / 命令面板快速入口共用）
export type NavKey = 'games' | 'free' | 'sites' | 'tools' | 'guides' | 'kit';
export const NAV: { no: string; key: NavKey; label: string; en: string; href: string }[] = [
  { no: '01', key: 'games', label: '游戏库', en: 'Games', href: '/games/' },
  { no: '02', key: 'free', label: '免费游戏', en: 'Free', href: '/free/' },
  { no: '03', key: 'sites', label: '资源站', en: 'Directory', href: '/resources/' },
  { no: '04', key: 'tools', label: '工具', en: 'Tools', href: '/tools/' },
  { no: '05', key: 'guides', label: '教程', en: 'Guides', href: '/guides/' },
  { no: '06', key: 'kit', label: '装机', en: 'Kit', href: '/kit/' },
];
export type NavCounts = Partial<Record<NavKey, number>>;
