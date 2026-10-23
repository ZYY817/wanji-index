import type { MetadataRoute } from 'next';
import site from '../../config/site.json';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/search/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
