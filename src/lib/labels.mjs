// 枚举存储值 → 中文展示名（enums.json 是值唯一源，本文件只做展示层映射）
// 未登记值回退显示原值——保证新增枚举前先登记而非页面裸奔

export const ZH = {
  platform: { steam: 'Steam', epic: 'Epic', gog: 'GOG', itch: 'itch.io', indiegala: 'IndieGala', official: '官方', 'xbox-pc': 'Xbox PC', other: '其他' },
  freeType: { permanent: '永久免费', limited: '限时领取', trial: '免费试玩', weekend: '免费周末', opensource: '开源' },
  channelType: { buy: '购买', free: '免费', trial: '试玩', subscription: '订阅' },
  siteCategory: { store: '商店', 'free-platform': '免费平台', indie: '独立游戏', mod: 'MOD 社区', localization: '汉化/本地化', 'guide-wiki': '攻略百科', 'patch-support': '补丁支持', other: '比价与数据' },
  toolType: { 'mod-manager': 'MOD 管理', save: '存档工具', 'perf-monitor': '性能监控', 'game-manager': '游戏管理', 'trainer-channel': '修改器渠道', 'compat-fix': '兼容修复', other: '其他' },
  entryType: { mod: 'MOD', localization: '汉化', patch: '补丁', 'guide-page': '攻略页', save: '存档', 'tool-page': '工具页', other: '资料' },
  guideKind: { tutorial: '教程', troubleshooting: '问题排查' },
  guideCategory: { 'install-run': '安装运行', 'launch-crash': '启动崩溃', mod: 'MOD 安装', 'save-backup': '存档备份', 'settings-compat': '设置兼容', performance: '性能优化' },
  os: { windows: 'Windows', linux: 'Linux', macos: 'macOS' },
};

export const zh = (group, key) => ZH[group]?.[key] ?? key;
