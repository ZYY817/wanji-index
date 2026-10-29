# V9 交接说明：视觉「中性玻璃」收尾 + 数据补全（给 Gemini）

> 这份文档交给执行模型。核心设计决定已经做完，不需要你重新设计。你要做的是**按规则逐个文件套用**，再把数据补全做完。
> 每做完一组就跑一次「验收」里的命令。遇到规则没覆盖的情况：**照最接近的已改好的组件做，不要自创新样式**。

---

## 0. 不能碰的硬约束

- **只收录正规来源**：官方商店、发行商、社区百科、MOD 平台。
  - 不收盗版站、破解站、DLC 解锁器，也不写"仅供学习"之类的免责文字。
  - 只做链接和摘要，不搬运原文。
- **提交**：只有用户说"提交"才 `git commit`。不要 push，不要部署。
- **中英双语**：页面里所有给人看的文字都要成对。
  - 组件里写 `<T zh="…" en="…" />`（`src/lib/i18n.tsx`）。
  - 客户端组件里的属性文字用 `useL()`（`src/components/layout/lang-toggle.tsx`）：`l('中文', 'English')`。
  - 新增的英文不要用机翻腔，照现有文案的口吻写。
- **Next.js 16**：写路由、配置相关代码前，先读 `node_modules/next/dist/docs/` 里对应的指南（见 `AGENTS.md`）。
- **以下文件是核心设计，不要改**（除非本文明确要求）：
  - `src/app/globals.css` 的 `@theme` 段
  - `src/components/ui/button.tsx`
  - `src/components/game/text-cover.tsx`
  - `src/components/layout/site-header.tsx`、`header-nav.tsx`、`lang-toggle.tsx`、`search-trigger.tsx`
  - `src/components/ui/tabs-nova.tsx`、`badge.tsx`、`kbd.tsx`
  - `scripts/subset-fonts.mjs`

---

## 1. V9 设计系统（已落地，照着用）

目标：苹果官网那种干净、通透的质感。游戏美术自己负责颜色，界面只给中性黑白灰，外加**一种蓝**。

### 颜色（Tailwind 类名 → 用途）

| 类名 | 值 | 用途 |
|---|---|---|
| `bg-background` / `bg-shell` | #000 | 页面底 |
| `bg-card` | #111113 | 卡片 |
| `bg-surface-2` / `bg-popover` | #1C1C1E | 浮层、二级面 |
| `text-foreground` | #F5F5F7 | 正文 |
| `text-fg-2` | #A1A1A6 | 次要文字 |
| `text-fg-3` | #86868B | 弱化文字（日期、计数） |
| `text-primary` | #2997FF | 文字链接、当前态、焦点。**只当文字或细线用** |
| `bg-cta` + `text-cta-foreground` | #0071E3 + 白 | 实心主按钮。整屏尽量只有一个 |
| `ok` / `warn` / `bad` / `info` | 系统色 | 状态 |
| `bg-paper` / `text-ink*` | #F5F5F7 / #1D1D1F | 浅色章节（装机） |

**禁止使用**：
- 暖棕、米黄、香槟金这一系的任何色值。
  - 旧值：#131211、#0C0B0A、#D8B67A、#E9E5DB、#EFEAE1。
  - 旧 rgba：`rgba(216,182,122,…)`、`rgba(12,11,10,…)`、`rgba(255,248,232,…)`。
- `bg-primary` 搭配文字做实心按钮或徽标。实心一律用 `bg-cta`。

### 圆角（token 已整体放大）

| 类名 | 半径 |
|---|---|
| `rounded-xs` | 6px |
| `rounded-sm` | 10px |
| `rounded-md` | 14px |
| `rounded-lg` | 20px |
| `rounded-xl` | 28px |

- 按钮、标签、筛选项、输入框一律用 `rounded-full`（胶囊）。
- 卡片用 `rounded-md` 或 `rounded-lg`。
- 图片缩略图用 `rounded-sm`。
- 不要再写 `rounded-[2px]`、`rounded-[4px]` 这类任意小值。

### 按钮

只用 `buttonVariants` / `Button` / `AcquireButton`（`src/components/ui/button.tsx`），**不要手写按钮样式**。

| variant | 外观 | 用在哪 |
|---|---|---|
| `solid` | 蓝色胶囊，白字 | 页面主操作（详情页"前往商店"、装机页"下载"） |
| `get` | 浅灰胶囊，蓝字（App Store「获取」） | **列表行里**的获取/领取按钮 |
| `outline` | 浅灰胶囊，白字，无描边 | 次要操作 |
| `ghost` | 透明，悬停浅灰 | 工具栏 |
| `ink` / `paper` | 深色胶囊 / 浅色胶囊 | 浅色章节里的主按钮和次要按钮 |

- 站内文字入口用 `TextLink`：蓝字加 `›`，悬停出下划线。
- 不要再用"白字 + 金色下划线"。

### 材质

全局类，定义在 `globals.css` 末尾：

| 类名 | 效果 | 用在哪 |
|---|---|---|
| `glass` | 深色毛玻璃 | 压在图片上的小控件、浮层 |
| `glass-light` | 浅色毛玻璃 | 浅色章节里的同类控件 |
| `lift` | 抬升卡片：深灰底 + 顶边细高光 + 柔和投影 | 需要"一块"感的卡片，替代 `border border-border` 方框 |
| `edge-light` | 图片卡的顶边高光 | 已改成中性白，继续用 |

全站颗粒层（film-grain、grain）已删除，**不要加回来**。

### 字体

- 标题统一用 `font-display`：Geist + 思源黑体子集，字重 `font-semibold`（600）。
- 中文字距最多收紧到 `tracking-[-0.02em]`。**不要再用 -0.04em 以下**，中文会挤在一起。
- `display-xl` / `display-hero` / `display-l` / `display-m` 工具类已调好，直接用。
- `font-mono` 只留给**真正的代码**：存档路径、报错原文、版本号 `<code>`。
  - 日期、计数、域名这类元数据用 `tabular`（等宽数字的无衬线）。
- 不要用 `uppercase`，也不要用 `tracking-[0.1em]` 以上的宽字距。
- 宋体已经移除（`font-serif` 不存在了）。
- 新增内容出现新汉字时运行 `npm run fonts`，重新生成 `src/fonts/sans/`。

---

## 2. 任务 A：视觉收尾（机械套用）

用 grep 定位 → 按规则改 → 截图看一眼 → 下一组。

### A1. 方框卡片 → 无描边卡片

以下文件里还有 `border border-border` 加圆角的"框"：

- `src/app/fixes/[slug]/page.tsx`
- `src/components/game/detail/detail-sections.tsx`（存档路径框）
- `src/components/offer/offer-panel.tsx`（`OfferHeroCard`，限时领取大卡）
- `src/components/rig/rig.tsx`（3 处）
- `src/components/rig/check-list.tsx`
- `src/components/layout/command-palette.tsx`（2 处）
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/toggle-group.tsx`

规则：
- 内容卡片：`border border-border bg-card rounded-sm` → `lift rounded-md`（或 `bg-card rounded-md`），去掉 `border`。
- 浮层（命令面板、下拉菜单）：`bg-popover rounded-lg ring-1 ring-white/[0.08] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]`。
- 表格（详情页配置要求表、`.prose-doc table`）：保留行分隔线，外框改成 `rounded-md overflow-hidden bg-card`，表头底色 `bg-white/[0.04]`。
- `toggle-group.tsx`：照 `tabs-nova.tsx` 改成胶囊分段控件。

### A2. 标题悬停变蓝 → 去掉

`hover:text-primary` 出现在 18 个文件里（`grep -rn "hover:text-primary" src`）。

- **卡片标题、列表标题**上的：删掉，或改成 `hover:text-foreground/80`。苹果的列表标题不变色。
- **纯文字链接**（句子里的链接、"查看全部"）上的：保留。
- `button.tsx` 里那一处不要动。

### A3. 任意小圆角

`src/components/home/film.tsx` 和 `src/components/home/kit-stage.tsx` 里的 `rounded-[2px]`、`rounded-[3px]`、`rounded-[4px]`、`rounded-[6px]`：

- 小色块、键帽 → `rounded-[5px]`。
- 周期表格子 → `rounded-[10px]`。
- `kit-stage.tsx` 里模拟 wanji-kit 真实界面的部分**不要改**（窗口里的文字、符号要和真实软件一致）。

### A4. 页头与章节标签

- `src/components/layout/page-masthead.tsx`、`detail-masthead.tsx`、`src/components/ui/section-label.tsx`：
  - 面包屑用 `text-xs text-fg-3`，分隔符用 `›`。
  - 标题后的计数如 `(117)` 改成 `text-fg-3 font-normal` 的纯数字，不加括号。
  - 去掉标题下方的发丝线分隔，改用留白（`mt-10` 起）。
- `src/components/catalog/filter-index.tsx` 左侧筛选栏：
  - 选中项 `bg-white/[0.1] rounded-sm`；未选中项悬停 `bg-white/[0.05]`。
  - 去掉选中项左侧的小方点。

### A5. 英文模式与移动端

每改完一组就跑：

```bash
node .shots/v13-audit.mjs
```

它会检查中英两种语言、1440 / 1024 / 390 三种宽度下的横向溢出和控制台报错。**要求全部 `all ok`**。

```bash
node .shots/v12-lang.mjs
```

英文模式下残留中文检测。新加的文字必须有英文。

---

## 3. 任务 B：数据补全（上一轮做了一半）

这部分代码改动已在工作区，**未提交**：
- `scripts/sync/steam-art.mjs`（新）：Steam 真实美术地址。
- `src/lib/data.mjs`：读 steam-art。
- `src/lib/merge-auto.mjs`：免费情报按 appid 自动关联游戏；自动资源条目合并。
- `scripts/validate.mjs`：合并时也覆盖 `entries`。
- `scripts/sync/steam-games.mjs`：免费情报里的游戏也建档。上次运行新增了 22 款，即 `data/auto/games/` 下的未跟踪文件。

### B1. 跑完同步

```bash
node scripts/sync/pcgw-paths.mjs
```

给新增的 22 款补存档、配置位置和已知问题。

```bash
node scripts/sync/steam-art.mjs
```

刷新美术地址。

### B2. 把新脚本加进日常同步

- `package.json` 的 `sync` 脚本：在 `offer-art.mjs` 之后加 `node scripts/sync/steam-art.mjs`。
- `.github/workflows/sync.yml`：在 offer-art 那一步之后加同样一步，格式照抄相邻的步骤。

### B3. 新脚本 `scripts/sync/game-entries.mjs`（自动资源入口）

为没有资源条目的游戏自动生成 `data/auto/entries/<gameId>-<siteId>-<type>.json`。

- 字段照 `schemas/entry.schema.json`，参考任意 `data/entries/*.json`。
- `siteId` 必须是 `data/sites/` 里已有的站点。

来源和条件：

| 来源 | 条件 | 入口地址 |
|---|---|---|
| Nexus Mods | 用 `https://data.nexusmods.com/file/nexus-data/games.json`（公开），英文名归一化后匹配；`mods` 数量 ≥ 20 才收 | `https://www.nexusmods.com/<domain_name>` |
| Thunderstore | `https://thunderstore.io/api/experimental/community/` 列表，按名称匹配 | 社区页 |
| Steam 创意工坊 | Steam appdetails 的 `categories` 里有 id 30 | `https://steamcommunity.com/app/<appid>/workshop/` |
| PCGamingWiki | 游戏 `_auto.pcgw` 里已有页面名 | 该页 |
| SteamDB | 有 Steam appid 的游戏都给 | `https://steamdb.info/app/<appid>/` |

写入规则：
- `reviewStatus: "unverified"`，`checkedAt` 为今天。
- `note` 写一句中文用途，例如"Nexus 上的 MOD 专区，共 1,234 个 MOD"；同时写 `noteEn`。
- 合并规则已在 `merge-auto.mjs` 里：人工条目优先，同游戏、同站点、同类型或同 URL 时跳过自动条目。
- 写完加进 `package.json` 的 `sync` 和工作流（放在 `steam-art` 之后）。

### B4. 条目英文字段

- `schemas/entry.schema.json` 加可选字段 `nameEn`、`noteEn`（字符串）。
- 显示条目说明的地方用 `<T zh={note} en={noteEn ?? note} />`。
  - `grep -rn "\.note\b" src/components src/app` 定位。

### B5. 新游戏标记与"最新发售"排序

- `src/lib/present.ts` 里给 `GameVM` 加 `releasedAt`（毫秒）和 `isNew`。
  - `releasedAt`：从 `releaseDate` 解析，兼容"2024 年 3 月 5 日"、"5 Mar, 2024"、"即将推出（…）"。
  - `isNew`：发售 ≤ 180 天，或"即将推出"。
- 海报卡左上角（`poster-card.tsx`，和"免费中"同一位置，两者并存时竖排）显示 `glass` 胶囊："新游戏 / New"。
- 游戏库排序（`filter-index.tsx` 的排序列表）加一项"最新发售 / Newest"，按 `releasedAt` 倒序。

### B6. 删除 3 条重复的人工 Epic 限时情报

`data/offers/epic-home-horror.json`、`epic-sker-ritual.json`、`epic-sorry-were-closed.json`。

- 自动同步（`free-giveaways.mjs`）已经抓到同样的活动，人工这 3 条会导致重复。
- 删除前先确认 `data/auto/offers/` 里有对应的自动记录。

---

## 4. 验收（每组任务后都跑）

```bash
npx tsc --noEmit -p .
```

```bash
node scripts/check-contrast.mjs
```

```bash
npm run build
```

`build` 内含：数据校验、字体覆盖检查、Next 构建、产物检查。**要求 0 阻断、产物 0 失败。**

```bash
node .shots/v13-audit.mjs
```

截图自查（开发服务器要先在 4321 端口运行）：

```bash
MSYS_NO_PATHCONV=1 OUT=.shots/check PAGES=/,/free/,/games/,/games/elden-ring/,/kit/,/fixes/ STEPS=4 node .shots/v15-look.mjs
```

截图出来后对照第 1 节逐条检查：
- 有没有暖色残留
- 有没有方框描边卡片
- 有没有一列实心蓝按钮
- 有没有等宽字体的日期

---

## 5. 做完后汇报格式

- 每个任务（A1–A5、B1–B6）一行：做了什么、改了哪些文件、验收结果。
- 没做完或拿不准的单独列出来，说明原因。
- **不要提交**，等用户说"提交"。
