# M0a 技术可行性验证报告

> 目的：验证 Astro + 原生 JS 能否可靠支撑「玩机索引」的数据模型、静态生成、关联反查、发布资格与 SEO 能力。
> 性质：一次性技术验证，非正式工程初始化。验证目录 `_m0a-verify/` 可整体废弃。
> 日期：2026-10-23。

## 0. 环境与验证项目结构

- Node v24.18.1 · npm 11.16.0 · astro@7.4.2 · @astrojs/sitemap（最新）· ajv（最新）
- 验证目录 `F:\网页\_m0a-verify\`：
```
config/{site,enums,redirects}.json
data/{games,sites,entries,tools,guides,offers}/*.json + guides/*.md   # 15 条测试记录
fixtures/bad/*.json        # 5 条投毒数据（不进入构建）
schemas/game.schema.json   # Ajv 结构校验
scripts/{validate,validate-bad,test-lifecycle,check-artifacts}.mjs
src/lib/{eligibility,data,lifecycle,search-index}.mjs
src/pages/{index,free,search}.astro + {games,resources,guides}/[slug].astro + search-index.json.js
```

## 1. 验证结果总览

| 验证项 | 目的 | 结果 | 关键证据 |
|---|---|---|---|
| V1 数据读取 | JSON/MD/配置/关联加载，错误提示 | ✅ 通过 | 15 条 JSON + 1 份 .md 全部加载渲染；负向 5/5 捕获错误信息可读 |
| V2 发布资格与反查 | 统一资格集合、反查、全排除规则 | ✅ 31/31 断言 | 5 游戏仅 1 生成页面；反查三区渲染；悬空关联忽略 |
| V3 静态详情页 | getStaticPaths 动态页+SEO | ✅ | `/games/ok-game/` 独立 HTML，canonical/JSON-LD/面包屑齐备 |
| V4 索引与 Sitemap | 索引边界、sitemap、noindex | ✅ | Entry 并入宿主、FreeOffer 不入索引、sitemap 干净 |
| V5 URL/部署兼容 | site/base/trailingSlash/双平台 | ✅（发现 2 问题已修） | 子路径构建 canonical/sitemap 全带前缀 |
| V6 生命周期 | 时区/仅日期/优先级/双端一致性 | ✅ 16/16 | 同一源文件构建期+浏览器两端运行 |
| V7 校验方案 | Ajv+自定义分层 | ✅ | Schema/枚举/唯一/关联/资格/产物六层各有归属 |

**完整数据链路已验证**：测试 JSON/MD → Ajv+业务校验 → eligibility → getStaticPaths → 反查渲染 → search-index + sitemap → 产物断言，全绿。**负向链路已验证**：毒数据按错误级被拦截并给出可读信息。

## 2. 分项记录

### V1 数据读取
- 操作：`import.meta.glob` 聚合 `data/**`（`_examples`/`pages` 段排除）；config/*.json 直接 import；`.md` 按同名 slug 加载渲染
- 结果：全部读取成功；指南页 `fix-error.md` 正文正确渲染进 HTML
- 发现：`import.meta.glob` 路径须从 `.astro` 文件位置计算（`[slug].astro` 在 `src/pages/guides/` 需 `../../../`）——路径深度错误时**静默不渲染**，需产物检查兜底
- 影响：`.md` 配套加载建议在正式工程收进 `lib`，不在页面内散落

### V2 发布资格与关联反查（核心验证）
| 场景 | 预期 | 实际 |
|---|---|---|
| 合格 Game | 生成详情页 | ✅ `/games/ok-game/` |
| published 但不达标（无 channels） | 不生成 | ✅ 无路由 |
| draft / offline / `_demo`（达标） | 不生成 | ✅ 全部无路由 |
| Entry→Game / Entry 无 gameId→Site | 入口行展示、无详情页 | ✅ 出现在游戏页/站点页，无 `/entries/` 路由 |
| FreeOffer 无 gameId | 进 `/free/` | ✅ 以 `gameTitle` 展示可检索 |
| FreeOffer | 无详情页/无索引项 | ✅ |
| 反查 | Game 不存列表，构建期反查 | ✅ MOD/工具/教程/限时提示条全部渲染 |
| 悬空可选引用（ghost-game） | 忽略+警告 | ✅ 警告记录、不渲染 |

**关键结论**：`eligibility.mjs` 单一判定处被详情页/索引/反查/索引文件共用，未出现过滤不一致——统一资格机制在 Astro 中落地直接。

### V3 静态页面生成
- `/games/ok-game/`：独立 HTML，URL 含尾斜杠；title/description/canonical 正常；`VideoGame`+`BreadcrumbList` JSON-LD 输出；速查条/渠道表/关联区按数据渲染；无数据模块整体缺席（DOM 中不存在）
- 构建输出为纯静态，零运行时 JS（除 free 页挂的 island）

### V4 搜索索引与 Sitemap
- `/search-index.json`：4 个合格实体（game/site/tool/guide）；**无 offer-\*/entry-\* 独立项**；`ok-game.linkedKeywords` 含 Entry 名"合格游戏 MOD 专区"；无 gameId 的 Entry 并入 `demo-site.linkedKeywords`
- sitemap（@astrojs/sitemap）：含全部生成页、排除 `/search/` 与 404；产物断言 sitemap ⊆ 实有 HTML
- `/search/`：`noindex,follow` meta 就位

### V5 URL 与部署兼容（发现两个真实问题）
1. **canonical 单源问题**：初版用 `config/site.json` 的 `siteCfg.url` 生成 canonical，平台特定构建（GH）域名仍是 pages.dev——已修正为 `Astro.site`（构建期注入的唯一定义点）。**教训：任何绝对 URL 必须走 Astro.site，不得另取数据源**
2. **Windows 环境变量陷阱**：Git Bash 把 `DEPLOY_BASE=/webindex/` 路径转换为 `C:/Program Files/Git/webindex/`，需 `MSYS_NO_PATHCONV=1` 前缀。正式工程的部署配置建议走文件/脚本而非裸环境变量
- 验证结果：`DEPLOY_BASE=/webindex/` 构建后 canonical=`https://user.github.io/webindex/games/ok-game/`、sitemap 全部 URL 带 `/webindex/` 前缀——**子路径兼容成立，但确属"同源两构建"，非同一产物**（与 docs/06 §3 修订一致）
- 未做：`_redirects` 与 meta-refresh 跳转页生成（M1+ 实现）、真实平台部署

### V6 生命周期（16/16 用例通过）
- `Asia/Shanghai` 手写 +08:00 解析；仅日期 `endDate`→当日 23:59:59+08:00
- 覆盖：进行中/未开始/已结束/截止不明/日期异常/核验过期/已结束+过期→ended 优先/无 startDate→uncertain/非法值/permanent+opensource+无时间 trial→null/weekend/带时间 trial
- **双端一致性**：`src/lib/lifecycle.mjs` 无 Node API；构建期 frontmatter import 渲染权威徽标；浏览器端同一文件经打包内联进 `/free/` 页面（dist 中确认函数体存在且运行）——"一份源两端引用"机制验证成立
- `checkedAt` 人工字段与 `buildTime` 构建注入在数据/页面层分离清晰

### V7 校验方案（分层评估结论）
| 规则类别 | 归属 | 验证 |
|---|---|---|
| 字段类型/必填/格式 | JSON Schema+Ajv | ✅ bad-missing 精确报 `/summary` 缺失 |
| 枚举合法性 | 自定义（对照 enums.json） | ✅ bad-enum 捕获 |
| ID/slug 唯一 | 自定义 | ✅ bad-dup 捕获 |
| 必填关联 | 自定义=阻断 | ✅ bad-ref 捕获 |
| 可选关联 | 自定义=警告 | ✅ ghost-game 记警告继续 |
| JSON 语法 | 解析层=阻断 | ✅ bad-json 捕获 |
| 资格/产物 | 自定义 | ✅ §V2/§V4 |
**结论**：Ajv 只做结构层，不能也不应承担业务规则——分层方案（schema/关联/资格/产物四层）验证有效，正式工程沿用。

## 3. 过程中发现的问题与修复

| # | 问题 | 性质 | 处理 |
|---|---|---|---|
| 1 | `data.mjs` 反查循环 `recs` 未定义 → 构建硬失败 | 验证代码 bug | 已修；证明错误会明确暴露而非静默 |
| 2 | `.md` glob 路径层级错误 → 静默不渲染 | 验证代码 bug | 已修；需产物检查兜底此类静默失败 |
| 3 | canonical 取 `siteCfg.url` 而非 `Astro.site` | 架构问题 | 已修并立规则（V5#1） |
| 4 | Windows MSYS 路径转换环境变量 | 环境问题 | 记录为部署注意事项 |

## 4. 兼容性评估（对照 docs/06 §2.2 条件）

| M0a 需实测的关键环节 | 结果 |
|---|---|
| `getStaticPaths` 按资格集合生成页面 | ✅ |
| 数据目录聚合加载 | ✅ |
| 反查模块渲染 | ✅ |
| 双轨徽标组件 | ✅（实心/描边两轨可表达） |
| `import.meta.glob` 读 JSON/MD | ✅ |

**长期维护成本判断**：低。同一 JS 生态覆盖全部环节；单语言、单构建链；依赖仅 astro+sitemap+ajv 三个。

## 5. 尚未验证（如实列出）

- 完整 13 种页面与 8 模板的全面实现（本验证覆盖 6 种页面形态）
- `_redirects` 与 meta-refresh 跳转页生成
- 全站客户端搜索/筛选/URL 状态恢复（仅验证了生命周期 island，未验证搜索交互本身）
- 真实 CF Pages/GH Pages 部署、404 状态码、预览回滚
- 大数据量构建性能（15 条 vs 未来数百条——预期无瓶颈但未压测）
- 冻结视觉规范的组件化还原度（本次无样式验证）

## 6. 结论与建议

**建议正式采用 Astro**。理由：docs/06 §2.2 全部验证条件实测通过；发布资格/反查/双轨状态/双层判定这些本项目最特殊的机制均无障碍落地；未发现需要换用 11ty 的能力缺口。

**M0 正式工程初始化的前置条件**：
1. 采用本验证的 lib 模式：`eligibility.mjs`（唯一资格判定）、`lifecycle.mjs`（双端共享纯函数）、`data.mjs`（glob 聚合+反查）、分层校验（Ajv+自定义）
2. 绝对 URL 一律 `Astro.site` 派生；部署参数走配置而非裸 env（Windows 兼容）
3. `.md` 配套加载收进 lib 层
4. 剩余实施项：redirects 双格式生成、全部 13 页面、搜索客户端、产物断言全集

**可复用成果**：4 个 lib 模块结构与判定逻辑、页面模板骨架、分层校验模式、产物断言清单。**临时废弃**：全部 fixture、验证脚本本体。**正式工程需重新实现**：完整组件/设计系统/13 路由/搜索客户端/redirects 生成。
