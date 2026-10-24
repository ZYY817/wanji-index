import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn 约定：合并条件类名并消解 Tailwind 冲突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 三位补零计数：7 → "007"（mono 计数母题） */
export const pad = (n: number, w = 2) => String(n).padStart(w, '0');

/** URL → 裸域名（目录行 mono 域名列） */
export function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
