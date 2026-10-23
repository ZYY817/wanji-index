// 站内路径唯一出口（客户端/raw href/fetch 用）
// next/link 会自动加 basePath；<a>/fetch 必须走本函数
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const withBase = (p: string) => `${BASE}${p.startsWith('/') ? p : `/${p}`}`;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';
