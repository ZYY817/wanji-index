// 游戏类型（genres 为自由字符串，非枚举）→ 中文展示名；未登记值回退原值
export const GENRE_ZH: Record<string, string> = {
  rpg: '角色扮演',
  action: '动作',
  adventure: '冒险',
  'open-world': '开放世界',
  strategy: '策略',
  simulation: '模拟',
  sandbox: '沙盒',
  survival: '生存',
  crafting: '建造',
  roguelike: 'Roguelike',
  card: '卡牌',
  metroidvania: '类银河恶魔城',
  'souls-like': '魂系',
  'turn-based': '回合制',
  'city-builder': '城市建造',
  automation: '自动化',
  colony: '殖民模拟',
  shooter: '射击',
  coop: '合作',
  racing: '竞速',
  sports: '体育',
  casual: '休闲',
  mmo: '大型多人',
  indie: '独立',
};

export const genreZh = (g: string) => GENRE_ZH[g] ?? g;
