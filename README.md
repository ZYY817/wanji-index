# 玩机索引（wanji-index）

中文 PC 游戏资源与工具索引，静态导出站点。视觉系统「放映厅 × 索引册」见 `docs/V2-视觉系统.md`。

技术栈：Next.js 16（App Router，`output: 'export'`）+ React 19 + Tailwind CSS v4 + Motion + Radix UI + Lenis。字体为本地 `geist` 与 `@fontsource-variable/noto-serif-sc`，不请求外部字体。

## 命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 开发服务器（localhost:4321） |
| `npm run validate` | 分层校验：config → Ajv Schema（`schemas/`，枚举单源 `config/enums.json`）→ 跨实体规则（唯一性/必填关联/可选悬空警告/未达标警告）。支持 `--data <目录>` |
| `npm run build` | 正式构建：`validate` → `next build` → `gen-redirects` → `check-artifacts out`；产物在 `out/` |
| `npm run build:test` | 测试构建：`tests/fixtures-data/` 与正式数据隔离 |
| `npm run check:artifacts` | 单独运行产物一致性检查（HTML/重定向/Sitemap/搜索索引） |
| `npm test` | 生命周期判定 16 用例 + `tests/bad/` 负向数据拦截 5 用例 |
| `npm run check:contrast` | Token 对比度核验（WCAG） |

## 配置单源

- **`config/site.json` 是唯一站点配置入口**：`site.url`、`site.base`、`review.staleDays`、`feedback.issueUrl` / `feedback.email`。改域名、部署子路径或反馈渠道只改这一处。
- 反馈渠道留空时，站内入口回落到 `/about/#feedback` 并提示渠道未开通；填写后详情页链接自动附带页面标题与正文模板。
- [`next.config.ts`](./next.config.ts) 通过 `src/lib/config.mjs` 读取并校验配置，注入 `basePath` 与 `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_BASE_PATH`；canonical、JSON-LD、Sitemap 统一使用 `src/lib/present.ts` 的 `SITE` / `SITE_BASE`，不得硬编码域名。
- 静态导出：`output: 'export'`、`trailingSlash: true`、`images.unoptimized: true`。站内 `next/link` 自动处理 `basePath`；原生 `<a>` 与 `fetch()` 使用 `withBase()`。

## 数据与资格

- 正式数据：`data/{games,sites,entries,tools,guides,offers}/`；`data/_examples/` 不加载。教程正文由同名 `.md` 合并进 `body`。
- Schema：`schemas/{entity}.schema.json`（draft-07）；`x-enum` 占位符加载时替换为 `config/enums.json` 值——新增枚举只改 `enums.json`。
- 发布资格唯一判定：[`eligibility.mjs`](./src/lib/eligibility.mjs)（`published` ∧ 类型最低标准 ∧ 非 `_demo`）；页面生成、索引、关联、Sitemap 共用。
- 测试 fixture 放 `tests/fixtures-data/`，负向用例放 `tests/bad/{用例}/`，由 `npm test` 验证全部被拦截。
- 关联与 Steam 美术派生：`src/lib/data.mjs`（`loadData` / `buildRelations` / `steamArt`）；视图模型：`src/lib/present.ts`。

### 新增内容

页面、筛选、关联列表、搜索索引与 Sitemap 都由 `data/` 在构建时生成，不需要改页面代码。

| 要新增 | 放置位置 | 需要同步的关联 |
|---|---|---|
| 游戏 | `data/games/<slug>.json` | `entries[].gameId`、`tools[].supportedGames`、`guides[].games`、`offers[].gameId` |
| 资源站 | `data/sites/<slug>.json` | `entries[].siteId` |
| 工具 | `data/tools/<slug>.json` | `supportedGames` 填游戏 id；教程侧 `tools` |
| 教程 | `data/guides/<slug>.json`，可选同名 `.md` 作为正文 | `games` / `tools` / `relatedGuides` |
| 免费情报 | `data/offers/<slug>.json` | `gameId` 可选；填写后进入该游戏的关联数据 |

1. 复制同目录现有条目改写，`id` 与 `slug` 全站唯一。
2. 按 `schemas/*.schema.json` 的必填项填写；`checkedAt` 是核验日期，不确定的状态标 `unverified`，不写猜测结论。
3. `npm run validate` 拦截 schema、重复 id、必填关联缺失；`npm run build` 会再次校验并检查产物。
4. 新增或修改枚举（平台、类型等）只改 `config/enums.json`，schema 通过 `x-enum` 自动同步。

## 流水线

`validate` → `next build`（含资格过滤、静态参数、Sitemap/Robots/搜索索引）→ `gen-redirects`（`_redirects`）→ `check-artifacts out`（非零即不部署）。

SEO：canonical、Open Graph、JSON-LD（WebSite / VideoGame / BreadcrumbList / HowTo 等）、`sitemap.xml`、`robots.txt`、`/search-index.json`。

## 设计系统

- `src/app/globals.css` 的 `@theme static` 是 Token 唯一来源；`--color-*`、字体、圆角、缓动都在此处。工具类：`container-x`、`meta`、`display-xl/l/m`、`text-outline`、`text-art`、`vertical`、`leader`、`hairline-grid`。
- 组件在 `src/components/`：`layout/`（顶栏/页脚/页头/命令面板）、`home/`（首页 7 章）、`catalog/`（筛选与目录）、`game/`、`offer/`、`kit/`、`ui/`、`fx/`、`seo/`。
- 双轨徽标：`LifecycleBadge` 实心 / `StatusBadge` 描边，不可混用。
- 实心按钮仅用于获取/领取/下载（`AcquireButton`）；站内导航用 `Button`；普通外链用 `ExtLink`（文字 + ↗）。
- 动效统一 Motion；Lenis 在 reduced-motion 与触屏不启用；SSR 初始文字全部可见。

## 路由

首页 7 章：开映 / 片库 / 档案 / 免费雷达 / 资源站目录（纸面反白）/ 装机 / 片尾。

`/games/`、`/free/`、`/resources/`、`/tools/`、`/guides/`、`/kit/`、`/about/`、`/search/`，以及游戏、资源站、工具、教程详情页。`/search/` 不进索引。静态产物包含 65 个 HTML、61 条 Sitemap URL、53 条站内搜索记录。

## 截图自查

`node scripts/shots.mjs [路径...] [--desktop|--mobile] [--steps=0,1,2] [--full] [--tag=xx]`，本机 Chrome，桌面 1440×900 / 移动 390×844，输出 `.shots/`（不提交）。

## 架构边界与后续演进

当前是静态优先架构：内容在构建期读取，产物是纯静态文件。前后端边界靠分层隔离，而不是靠“现在有没有服务器”：

| 层 | 当前实现 | 未来替换方式 |
|---|---|---|
| 内容契约 | `schemas/` + `data/` JSON | CMS / API 返回同形状记录 |
| 数据访问 | `src/lib/data.mjs` 的 `loadData()` / `buildRelations()` | 构建期 fetch 或运行时查询；改为异步时页面补 `await` |
| 视图模型 | `src/lib/present.ts` | API 字段映射集中改这里 |
| 运行时读接口 | `/search-index.json` 静态文件 | 同形状 HTTP API，客户端 `loadSearchIndex` 不用改 |
| 反馈 / 写入 | `config/site.json` 的 `feedback` | 表单或独立服务，不进入静态产物 |

已落地的约束：

- 客户端组件只接收 props，或通过 `/search-index.json` 读数据；不 import `data/`、`data.mjs` 或 Node API。
- 页面不做资格过滤；发布资格、关联、排序、日期判定都在数据层与 `present.ts`。
- 写入类能力（收录提交、纠错）保持为外部渠道，不在静态站里伪造本地状态。

演进路径：

1. **继续静态托管（当前阶段推荐）**：构建期从 CMS/API 拉取 JSON → 校验 → 现有流水线；免费静态托管不变。
2. **需要运行时数据**：只把搜索、反馈等具体能力换成独立 API；内容主体仍静态生成。
3. **需要账号 / 数据库**：移除 `output: 'export'` 改为 SSR/ISR，把 `loadData()` 换成异步数据访问；页面结构与视图模型保持。

## 部署

构建产物 `out/` 为纯静态文件，可直接部署到 Cloudflare Pages 等静态托管；`_redirects` 随产物生成。部署域名确定后修改 `config/site.json` 并重新构建。
