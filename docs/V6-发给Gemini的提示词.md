# 发给 Gemini 的提示词（B → C → D → E，一次发一段）

用法：
- 每次只复制一段代码框里的全部内容，发给 Gemini。
- 它做完以后，你在浏览器里看一眼，再让 Claude 检查（只说一句"检查 B"就行）。
- 检查通过、提交之后，再发下一段。

已完成：基础层（提示词 0）、页头重做、A 段（游戏库 + 游戏详情）。

---

## 第 1 段 · B 免费游戏（/free/）

```
请打开项目文件夹 F:\网页，完整阅读文件 F:\网页\docs\V6-内页阅读性重整规划与提示词.md（特别是第二节「全站阅读性规范」和末尾第六节「给页面 AI 的说明」，包括其中第 3 条关于新页头的说明）。

读完后，只执行第四节里「提示词 B · 免费游戏」这一段的任务，其他提示词不要做。

补充要求（以这里为准）：
- 页头已经重做好了（顶部标题 + 一句话 + 下方滚动的免费游戏条），不要改页头，只改页头下面的筛选条和列表。
- 卡片和列表的游戏名一律用 o.titleZh ?? o.title 作主标题；有 o.titleOrig 时在下面加一行 text-sm text-fg-2 的原名。不能再出现「Home – A Unique Horror Adventure」这种英文名占主标题、中文名缺失的情况（没有中文名的可以保留原名）。
- 现在每张卡都放一个很大的倒计时，三张并排时满屏数字。倒计时只给「限时领取」和「即将开始」，其他分组改成紧凑列表行。
- 筛选条下滑吸顶时上方不能露出内容（用 --sticky-top）。

不要修改：首页（src/app/page.tsx、src/components/home/*、src/components/fx/*）；共用文件（globals.css、page-masthead.tsx、masthead-bands.tsx、detail-masthead.tsx、detail-section.tsx、category-rail.tsx、filter-index.tsx、site-header.tsx、src/components/ui/*）。确实需要改，写进汇报里，不要直接改。

完成标准：npx tsc --noEmit -p . --noUnusedLocals、npm test、npm run check:contrast、npm run build 全部通过；1440×900 和 390×844 两个尺寸下逐屏截图自查。不要提交、不要推送。做完后把改动文件清单和前后对比截图发给我。
```

---

## 第 2 段 · C 资源站（/resources/ 与 /resources/[slug]/）

```
请打开项目文件夹 F:\网页，完整阅读文件 F:\网页\docs\V6-内页阅读性重整规划与提示词.md（特别是第二节「全站阅读性规范」和末尾第六节「给页面 AI 的说明」，包括其中第 3 条关于新页头的说明）。

读完后，只执行第四节里「提示词 C · 资源站列表 + 详情」这一段的任务，其他提示词不要做。

补充要求（以这里为准）：
- 列表页页头已经重做好了（顶部标题 + 一句话 + 下方滚动的站标条），不要改页头。
- 左侧分类里现在还显示「其他」，一律改为显示「比价与数据」（只改显示文字，可在 src/components/catalog/resources-catalog.tsx 或 src/app/resources/page.tsx 里映射，不要改 src/lib/labels.mjs）。分类顺序与首页一致：商店、MOD 社区、独立游戏、攻略百科、比价与数据。
- 每个站点行：Logo 44px + 站名 + 域名 + 一句用途（1 行）+ 右侧箭头，行高一致，整行可点。
- 详情页（例如 /resources/steam/）首屏：Logo + 站名 + 域名 + 一句定位 + 右侧「前往官网」主按钮；下面三格事实：语言、费用、核验日期；正文行宽不超过 38em。

不要修改：首页（src/app/page.tsx、src/components/home/*、src/components/fx/*）；共用文件（globals.css、page-masthead.tsx、masthead-bands.tsx、detail-masthead.tsx、detail-section.tsx、category-rail.tsx、filter-index.tsx、site-header.tsx、src/components/ui/*）。确实需要改，写进汇报里，不要直接改。

完成标准：npx tsc --noEmit -p . --noUnusedLocals、npm test、npm run check:contrast、npm run build 全部通过；1440×900 和 390×844 两个尺寸下逐屏截图自查（至少 /resources/、/resources/steam/、/resources/nexus-mods/）。不要提交、不要推送。做完后把改动文件清单和前后对比截图发给我。
```

---

## 第 3 段 · D 工具 + 教程（/tools/、/guides/ 及详情页）

```
请打开项目文件夹 F:\网页，完整阅读文件 F:\网页\docs\V6-内页阅读性重整规划与提示词.md（特别是第二节「全站阅读性规范」和末尾第六节「给页面 AI 的说明」，包括其中第 3 条关于新页头的说明）。

读完后，只执行第四节里「提示词 D · 工具 + 教程」这一段的任务，其他提示词不要做。

补充要求（以这里为准）：
- 工具列表和教程列表的页头已经重做好了（工具是滚动的工具名，教程是滚动的报错原文），不要改页头。
- 教程详情（例如 /guides/stardew-smapi-mods/）保留现有的步骤结构（大号步骤编号 + 标题 + 说明 + 「预期结果」框 + 「如果没有解决」），只调字号、行宽和层级：步骤说明 text-base、颜色用 text-foreground（不要用灰色写正文）、主栏最宽 760px；右侧步骤目录吸顶（用 --sticky-top），当前步骤高亮。
- 报错类教程标题里的文件名（如 d3dx9_43.dll）用等宽字体且不换行。
- 手机端：步骤目录收成顶部「步骤 1/4」可展开条。

不要修改：首页（src/app/page.tsx、src/components/home/*、src/components/fx/*）；共用文件（globals.css、page-masthead.tsx、masthead-bands.tsx、detail-masthead.tsx、detail-section.tsx、category-rail.tsx、filter-index.tsx、site-header.tsx、src/components/ui/*）。确实需要改，写进汇报里，不要直接改。

完成标准：npx tsc --noEmit -p . --noUnusedLocals、npm test、npm run check:contrast、npm run build 全部通过；1440×900 和 390×844 两个尺寸下逐屏截图自查（至少 /tools/、/tools/smapi/、/guides/、/guides/stardew-smapi-mods/）。不要提交、不要推送。做完后把改动文件清单和前后对比截图发给我。
```

---

## 第 4 段 · E 关于 + 搜索 + 装机页（/about/、/search/、/kit/）

```
请打开项目文件夹 F:\网页，完整阅读文件 F:\网页\docs\V6-内页阅读性重整规划与提示词.md（特别是第二节「全站阅读性规范」和末尾第六节「给页面 AI 的说明」，包括其中第 3 条关于新页头的说明）。

读完后，只执行第四节里「提示词 E · 关于 + 搜索 + 装机页」这一段的任务，其他提示词不要做。

补充要求（以这里为准）：
- 关于页：正文现在是浅灰色，而且右边空着一大片。正文改用 text-foreground，主栏最宽 760px 左对齐；分节用 DetailSection（标题在内容正上方）；收录数据用一张简洁的两列表格。
- 搜索页：搜索框在顶部（高 56px、text-lg），结果按「游戏 / 资源站 / 工具 / 教程」分组，每组最多 5 条 + 「查看全部」；空状态给 3 个热门搜索建议。
- 装机页：保留浅色纸面风格，明确标注「开发中，以下为演示数据」；检测状态用 ✓ / ✕ / ! 加文字（已安装 / 缺失 / 过旧），不能只靠颜色区分；底部列出可手动安装的官方运行库链接（只链接微软官方页面）。
- 修复手机 390px 下装机页 1px 宽度溢出：src/components/kit/kit-hero.tsx 里带 -left-[10%] 的那条光带，给它的父容器加 overflow-hidden 或改用 inset 写法。

不要修改：首页（src/app/page.tsx、src/components/home/*、src/components/fx/*）；共用文件（globals.css、page-masthead.tsx、masthead-bands.tsx、detail-masthead.tsx、detail-section.tsx、category-rail.tsx、filter-index.tsx、site-header.tsx、src/components/ui/*）。确实需要改，写进汇报里，不要直接改。

完成标准：npx tsc --noEmit -p . --noUnusedLocals、npm test、npm run check:contrast、npm run build 全部通过；1440×900 和 390×844 两个尺寸下逐屏截图自查。不要提交、不要推送。做完后把改动文件清单和前后对比截图发给我。
```
