import type { MetadataRoute } from 'next';
import { loadData } from '@/lib/data.mjs';
import site from '../../config/site.json';

const BASE = site.url.replace(/\/$/, '');

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const data = loadData();
  const urls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/games/`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/free/`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/resources/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/tools/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/fixes/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/guides/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/check/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/kit/`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about/`, changeFrequency: 'monthly', priority: 0.4 },
  ];
  for (const g of data.games) urls.push({ url: `${BASE}/games/${g.slug}/`, lastModified: g.updatedAt, priority: 0.9 });
  for (const s of data.sites) urls.push({ url: `${BASE}/resources/${s.slug}/`, lastModified: s.updatedAt, priority: 0.7 });
  for (const t of data.tools) urls.push({ url: `${BASE}/tools/${t.slug}/`, lastModified: t.updatedAt, priority: 0.7 });
  for (const p of data.problems) urls.push({ url: `${BASE}/fixes/${p.slug}/`, lastModified: p.updatedAt, priority: 0.9 });
  for (const g of data.guides) urls.push({ url: `${BASE}/guides/${g.slug}/`, lastModified: g.updatedAt, priority: 0.7 });
  return urls;
}
