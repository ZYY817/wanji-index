// 枚举存储值 → 中文展示名（enums.json 是值唯一源，本文件只做展示层映射）
// 未登记值回退显示原值——保证新增枚举前先登记而非页面裸奔

export const ZH = {
  platform: { steam: 'Steam', epic: 'Epic', gog: 'GOG', itch: 'itch.io', indiegala: 'IndieGala', official: '官方', 'xbox-pc': 'Xbox PC', other: '其他' },
  freeType: { permanent: '永久免费', limited: '限时领取', trial: '免费试玩', weekend: '免费周末', opensource: '开源' },
  channelType: { buy: '购买', free: '免费', trial: '试玩', subscription: '订阅' },
  siteCategory: { store: '商店', 'free-platform': '免费平台', indie: '独立游戏', mod: 'MOD 社区', localization: '汉化/本地化', 'guide-wiki': '攻略百科', 'patch-support': '补丁支持', other: '比价与数据' },
  toolType: { 'mod-manager': 'MOD 管理', 'mod-loader': 'MOD 前置', graphics: '画质与帧率', driver: '驱动与外设', save: '存档工具', 'perf-monitor': '性能监控', 'game-manager': '游戏管理', 'trainer-channel': '修改器渠道', 'compat-fix': '兼容修复', other: '其他' },
  entryType: { mod: 'MOD', localization: '汉化', patch: '补丁', 'guide-page': '攻略页', save: '存档', 'tool-page': '工具页', other: '资料' },
  problemCategory: { crash: '闪退崩溃', launch: '无法启动', dll: '缺少文件', display: '画面显示', performance: '卡顿掉帧', save: '存档', input: '手柄键鼠', network: '联机网络' },
  guideKind: { tutorial: '教程', troubleshooting: '问题排查' },
  guideCategory: { 'install-run': '安装运行', 'launch-crash': '启动崩溃', mod: 'MOD 安装', 'save-backup': '存档备份', 'settings-compat': '设置兼容', performance: '性能优化' },
  os: { windows: 'Windows', linux: 'Linux', macos: 'macOS' },
};

export const zh = (group, key) => ZH[group]?.[key] ?? key;

// 英文展示名（中英切换用；缺的回退到中文映射 → 原值）
export const EN = {
  platform: { steam: 'Steam', epic: 'Epic', gog: 'GOG', itch: 'itch.io', indiegala: 'IndieGala', official: 'Official', 'xbox-pc': 'Xbox PC', other: 'Other' },
  freeType: { permanent: 'Free to play', limited: 'Free to keep', trial: 'Free trial', weekend: 'Free weekend', opensource: 'Open source' },
  channelType: { buy: 'Buy', free: 'Free', trial: 'Trial', subscription: 'Subscription' },
  siteCategory: { store: 'Store', 'free-platform': 'Free platform', indie: 'Indie', mod: 'Mod community', localization: 'Localization', 'guide-wiki': 'Wiki & guides', 'patch-support': 'Patches', other: 'Deals & data' },
  toolType: { 'mod-manager': 'Mod manager', 'mod-loader': 'Mod loader', graphics: 'Graphics & FPS', driver: 'Drivers & devices', save: 'Saves', 'perf-monitor': 'Performance', 'game-manager': 'Game manager', 'trainer-channel': 'Trainers', 'compat-fix': 'Compatibility', other: 'Other' },
  entryType: { mod: 'Mod', localization: 'Chinese patch', patch: 'Patch', 'guide-page': 'Guide', save: 'Save', 'tool-page': 'Tool', other: 'Resource' },
  problemCategory: { crash: 'Crashes', launch: "Won't launch", dll: 'Missing files', display: 'Display', performance: 'Performance', save: 'Saves', input: 'Controller & input', network: 'Online' },
  guideKind: { tutorial: 'Tutorial', troubleshooting: 'Troubleshooting' },
  guideCategory: { 'install-run': 'Install & run', 'launch-crash': 'Launch & crashes', mod: 'Mods', 'save-backup': 'Save backup', 'settings-compat': 'Settings', performance: 'Performance' },
  os: { windows: 'Windows', linux: 'Linux', macos: 'macOS' },
};
export const en = (group, key) => EN[group]?.[key] ?? ZH[group]?.[key] ?? key;
