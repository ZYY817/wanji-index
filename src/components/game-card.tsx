import Link from 'next/link';
import { steamCover } from '@/lib/data.mjs';
import { Tag } from './badges';

// 游戏卡片：Steam 官方 CDN 封面 + 名称 + 类型 + 资源计数
// 无封面的游戏回退为文字封面（首字母琥珀色块）
export function GameCard({ game, counts = '' }: { game: any; counts?: string }) {
  const cover = steamCover(game);
  return (
    <Link href={`/games/${game.slug}/`} className="card group block overflow-hidden">
      <div className="relative aspect-[460/215] overflow-hidden bg-[var(--color-ink-2)]">
        {cover ? (
          <img src={cover} alt={`${game.name.zh} 封面`} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl font-black text-[var(--color-amber)] opacity-60">{game.name.zh[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,14,19,0.72)] via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold tracking-tight group-hover:text-[var(--color-amber-hi)] transition-colors">{game.name.zh}</h3>
          {game.name.en && <span className="meta truncate">{game.name.en}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {(game.genres ?? []).slice(0, 2).map((g: string) => <Tag key={g}>{g}</Tag>)}
          {counts && <span className="mono ml-auto text-[var(--color-txt-3)]">{counts}</span>}
        </div>
      </div>
    </Link>
  );
}
