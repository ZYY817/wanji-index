// 自动收录 Epic 每周免费：Epic 官方免费游戏接口（store-site-backend-static … freeGamesPromotions），
// 正在免费的记为「限时领取」，已公布的下一期记为「即将开始」，写入 data/auto/offers/。
// 已结束超过 14 天的自动记录会被清理；同一活动已有人工记录时，构建时以人工记录为准（src/lib/merge-auto.mjs）。
//
// 用法：node scripts/sync/epic-free.mjs
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, getJson, readAuto, writeAuto, today, slugify } from './lib.mjs';

const URL = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN';
const j = await getJson(URL);
const elements = j?.data?.Catalog?.searchStore?.elements;
if (!elements) { console.log('Epic 接口暂时不可用，本次跳过（不影响已有数据）'); process.exit(0); }

const img = (e, ...types) => types.map((t) => e.keyImages?.find((k) => k.type === t)?.url).find(Boolean);
const pageSlug = (e) => e.offerMappings?.find((m) => m.pageType === 'productHome')?.pageSlug ?? e.catalogNs?.mappings?.find((m) => m.pageType === 'productHome')?.pageSlug ?? e.productSlug?.replace(/\/home$/, '');
const hasCJK = (s) => /[一-鿿]/.test(s);

let written = 0;
for (const e of elements) {
  // 只要「打到 0 元」的促销：当前一期 + 下一期
  const pick = (groups) => (groups ?? []).flatMap((g) => g.promotionalOffers ?? []).find((o) => o.discountSetting?.discountPercentage === 0);
  const now = pick(e.promotions?.promotionalOffers);
  const next = pick(e.promotions?.upcomingPromotionalOffers);
  const offer = now ?? next;
  const slug = pageSlug(e);
  if (!offer || !slug) continue;
  const title = e.title.replace(/[™®©]/g, '').replace(/^《(.+)》$/, '$1').trim();
  const start = offer.startDate.slice(0, 10).replace(/-/g, '');
  const id = `auto-epic-${slugify(slug) || slugify(e.title)}-${start}`;
  const rec = {
    id,
    gameTitle: title,
    ...(hasCJK(title) ? { titleZh: title } : {}),
    type: 'limited',
    platform: 'epic',
    url: `https://store.epicgames.com/zh-CN/p/${slug}`,
    claimNote: now ? 'Epic 每周限免，领取后永久保留在库中' : 'Epic 下一期每周限免（已公布）',
    claimNoteEn: now ? 'Epic weekly freebie — yours to keep once claimed' : 'Next Epic weekly freebie (announced)',
    startDate: offer.startDate,
    endDate: offer.endDate,
    checkedAt: today(),
    linkHealth: 'ok',
    note: '来自 Epic 官方免费游戏接口，自动更新；截止时间以 Epic 页面为准',
    art: { wide: img(e, 'OfferImageWide', 'DieselStoreFrontWide', 'Thumbnail'), tall: img(e, 'OfferImageTall', 'DieselStoreFrontTall') },
    createdAt: today(), updatedAt: today(),
    publishStatus: 'published',
  };
  if (!rec.art.wide) delete rec.art;
  else if (!rec.art.tall) delete rec.art.tall;
  if (writeAuto('offers', rec)) written++;
}

// 清理：已结束超过 14 天的自动记录
let removed = 0;
for (const [id, r] of readAuto('offers')) {
  if (!id.startsWith('auto-epic-')) continue;
  if (r.endDate && Date.now() - Date.parse(r.endDate) > 14 * 864e5) { rmSync(join(AUTO, 'offers', `${id}.json`)); removed++; }
}
console.log(`Epic 免费同步完成：写入 / 更新 ${written} 条，清理过期 ${removed} 条`);
