// 装机工具的发布信息（scripts/sync/kit-release.mjs 每天从 GitHub 同步到 data/auto/kit.json）
import kit from '../../data/auto/kit.json';

export type KitComponent = { id: string; name: string; short: string; category: string; importance: string; why: string; sizeMb?: number };
export type KitRelease = {
  repo: string; version: string; title: string; publishedAt: string; releaseUrl: string;
  asset: { name: string; url: string; sizeMb: number; downloads: number } | null;
  catalog: { version: number; updatedAt: string; components: KitComponent[] } | null;
  shots: { name: string; src: string; width: number; height: number }[];
  checkedAt: string;
};

export const KIT = kit as KitRelease;

/** 组件分类（与 wanji-kit catalog 的 category 对应） */
export const KIT_CATEGORIES: { key: string; zh: string; en: string; fix?: string }[] = [
  { key: 'vcredist', zh: 'Visual C++ 运行库', en: 'Visual C++ runtimes', fix: 'missing-dll' },
  { key: 'dotnet', zh: '.NET', en: '.NET', fix: 'game-wont-launch' },
  { key: 'directx', zh: 'DirectX', en: 'DirectX', fix: 'missing-dll' },
  { key: 'runtime', zh: '其他运行时', en: 'Other runtimes' },
  { key: 'middleware', zh: '游戏中间件', en: 'Game middleware' },
  { key: 'windows', zh: 'Windows 组件', en: 'Windows features' },
  { key: 'setting', zh: '系统优化（可跳过）', en: 'System tweaks (optional)', fix: 'stutter-low-fps' },
];

/** 按北京时间显示日期 */
export const kitDate = (iso: string) => new Date(Date.parse(iso) + 8 * 3600e3).toISOString().slice(0, 10);
