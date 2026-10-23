# 玩机索引（wanji-index）

中文 PC 游戏资源与工具索引——静态站点。产品/交互/视觉规范见 `docs/`（`docs/05` 已冻结）。

## 命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 开发服务器（localhost:4321） |
| `npm run validate` | 分层校验：config → Ajv Schema（`schemas/`，枚举值单源 `enums.json`）→ 跨实体规则（唯一性/必填关联/可选悬空警告/未达标警告）。支持 `--data <目录>` 测任意数据源 |
| `npm run build` | 正式构建 → `dist/`（内含 `check:artifacts` 产物断言，失败即非零退出） |
| `npm run build:test` | 测试构建：`tests/fixtures-data/` → `dist-test/`（与正式数据隔离） |
| `npm run check:artifacts` | 单独运行产物一致性检查 |
| `npm test` | 单元+负向测试：生命周期判定（16 用例）+ `tests/bad/` 投毒数据拦截（5 用例） |
| `npm run check:contrast` | Token 对比度公式核验（15 组，WCAG） |

## 配置单源

- **`config/site.json` 是唯一站点配置入口**：`site.url`（域名）、`base`（部署子路径）、`review.staleDays` 全部在此。改域名/路径只改这一个文件。
- `astro.config.mjs` 经 `src/lib/config.mjs` 读取并校验后注入 `site`/`base`；模板用 `Astro.site`/`Astro.url` 生成 canonical，**不得硬编码域名**。
- `.astro`/组件内使用 `import cfg from 'config/site.json'`（Vite 打包）；`config.mjs` 的 fs 加载仅限 Node 侧（astro.config、scripts）。
- `urlStatus: "placeholder"` 为开发占位域名标记——正式域名确定后改 `site.url` 一处。
- 部署 `base` 经配置读取+校验（须 `/` 开头结尾），**不要**依赖裸 Shell 环境变量（Windows Git Bash 会改写路径）。

## 数据与资格

- 正式数据：`data/{games,sites,entries,tools,guides,offers}/`；示例隔离区 `data/_examples/` 不加载。
- Schema：`schemas/{entity}.schema.json`（draft-07）；`x-enum` 占位符在加载时替换为 `config/enums.json` 值——**新增枚举只改 enums.json**。
- 发布资格唯一判定：`src/lib/eligibility.mjs`（`published` ∧ 达标 ∧ 非 `_demo`）——页面生成/索引/关联/Sitemap 共用。
- 测试 fixture 放 `tests/fixtures-data/`，只经 `build:test` 进 `dist-test/`；负向用例放 `tests/bad/{用例}/`，由 `npm test` 验证全部被拦截。
- `src/lib/` 职责：`config.mjs`/`schema.mjs` 仅 Node 侧（fs）；`eligibility.mjs`/`lifecycle.mjs`/`load.mjs` 构建+页面共用；`lifecycle.mjs` 纯函数可进浏览器。

## 流水线（docs/06 §7）

`validate`（S2）→ `astro build`（S3 构建+S4/S5 资格/模板）→ `check:artifacts`（S8，非零即不部署）。

## 设计系统（docs/05 冻结规范）

- `src/styles/tokens.css` = 全部 Token 唯一来源；`base.css` 全局样式只消费 Token。
- 组件在 `src/components/`；双轨徽标是两个组件（`LifecycleBadge` 实心 / `StatusBadge` 描边），形态不可混用。
- 实色按钮仅 `AcquireButton`（获取/领取）；站内导航 `OutlineButton`；普通外链 `ExtLink`（文字+↗）。
- 组件预览页 `/design/`（noindex、不进 sitemap）用于验收。

## 里程碑

M0–M6 全部完成：18 页可构建站点（`/`、`/games/`、`/free/`、`/resources/`、`/tools/`、`/guides/`、`/search/`、`/about/`、详情页）。执行记录见 `docs/M*.md`。
M7 部署待执行——需 GitHub 仓库+Cloudflare Pages 项目（见 `docs/M3至M7-网站主体建设记录.md` §5）。
