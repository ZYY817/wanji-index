import { cn } from '@/lib/utils';

// 印刷对位标记：四角 L 形裁切线（母题）。父元素需 position: relative
export function CropMarks({ className, size = 10, inset = -1, strokeWidth = 1 }: { className?: string; size?: number; inset?: number; strokeWidth?: number }) {
  const base = 'pointer-events-none absolute';
  const corner = (sides: string, pos: React.CSSProperties): React.CSSProperties => ({
    width: size,
    height: size,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopWidth: sides.includes('t') ? strokeWidth : 0,
    borderRightWidth: sides.includes('r') ? strokeWidth : 0,
    borderBottomWidth: sides.includes('b') ? strokeWidth : 0,
    borderLeftWidth: sides.includes('l') ? strokeWidth : 0,
    ...pos,
  });
  return (
    <span aria-hidden className={cn('text-fg-3', className)}>
      <span className={base} style={corner('tl', { left: inset, top: inset })} />
      <span className={base} style={corner('tr', { right: inset, top: inset })} />
      <span className={base} style={corner('bl', { left: inset, bottom: inset })} />
      <span className={base} style={corner('br', { right: inset, bottom: inset })} />
    </span>
  );
}
