import Link from 'next/link';
import { OutlineButton } from '@/components/buttons';

export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <p className="mono text-7xl font-black text-[var(--color-txt-3)]">404</p>
      <p className="mt-3 text-[var(--color-txt-2)]">这个页面不存在——可能链接已失效，或内容从未收录。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <OutlineButton href="/" label="回首页" />
        <OutlineButton href="/games/" label="游戏库" />
        <OutlineButton href="/resources/" label="资源站" />
      </div>
      <p className="meta mt-8">如果这个地址应该存在，<Link href="/about/#feedback" className="text-[var(--color-amber-hi)]">告诉我们</Link>。</p>
    </div>
  );
}
