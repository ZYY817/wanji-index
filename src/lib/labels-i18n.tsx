// 枚举 / 类型标签的双语渲染：页面上显示标签时用这里的 L() / G()，拼接成搜索字符串时仍用 labels.mjs 的 zh()
import { T } from '@/lib/i18n';
import { zh, en } from '@/lib/labels.mjs';
import { genreZh, genreEn } from '@/lib/genre';

export const L = (group: string, key: string) => <T zh={zh(group, key)} en={en(group, key)} />;
export const G = (g: string) => <T zh={genreZh(g)} en={genreEn(g)} />;
