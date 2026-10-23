import Link from 'next/link';
import site from '../../config/site.json';
import { withBase } from '@/lib/base';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-line-0)] py-8">
      <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-txt-3)]">
        <span>© {new Date().getFullYear()} {site.name} · 个人维护的非商业索引</span>
        <Link href="/about/" className="hover:text-[var(--color-txt-2)]">关于与收录说明</Link>
        <Link href="/about/#feedback" className="hover:text-[var(--color-txt-2)]">反馈</Link>
        <a href={withBase('/sitemap.xml')} className="hover:text-[var(--color-txt-2)]">Sitemap</a>
        <span className="ml-auto">只收录可信来源入口，不托管游戏文件</span>
      </div>
    </footer>
  );
}
