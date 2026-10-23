// 站内链接唯一出口 —— 自动拼接部署 base（import.meta.env.BASE_URL 由 Astro 注入）
// 规则：所有站内 href/action/fetch 一律走 withBase('/x/')，禁止裸写 '/x/' 绝对路径
// 这样同一份代码可同时支撑 Cloudflare 根路径（base=/）与 GitHub 子路径（base=/repo/）
export const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
export const withBase = (p) => `${base}${p.startsWith('/') ? p : `/${p}`}`;
