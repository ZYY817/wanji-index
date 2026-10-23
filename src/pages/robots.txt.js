// robots.txt —— 域名走 site.json 单源，不硬编码
import site from '../../config/site.json';

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${site.url.replace(/\/$/, '')}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}
