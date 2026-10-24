import Link from 'next/link';
import type { ReactNode } from 'react';
import site from '../../../config/site.json';

type FeedbackConfig = { issueUrl?: string; email?: string };
const feedback = (site as { feedback?: FeedbackConfig }).feedback ?? {};

// 反馈目的地统一由 config/site.json 决定：配置后全站自动启用，未配置时回落到说明页。
function externalHref(page: string) {
  const body = `页面：${page}\n\n问题：\n\n正确来源：\n`;
  if (feedback.issueUrl) {
    const url = new URL(feedback.issueUrl);
    url.searchParams.set('title', `[内容反馈] ${page}`);
    url.searchParams.set('body', body);
    return url.toString();
  }
  if (feedback.email) {
    return `mailto:${feedback.email}?subject=${encodeURIComponent(`[内容反馈] ${page}`)}&body=${encodeURIComponent(body)}`;
  }
  return null;
}

export function FeedbackLink({ page, className, children = '反馈信息错误' }: {
  page: string; className?: string; children?: ReactNode;
}) {
  const href = externalHref(page);
  const label = <>{children}<span aria-hidden> ↗</span></>;
  if (!href) return <Link href="/about/#feedback" className={className}>{label}</Link>;
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  );
}

export function FeedbackChannels() {
  if (!feedback.issueUrl && !feedback.email) {
    return <>
      <p>公开反馈渠道尚未开通。站点上线时会在此公布 GitHub Issues 入口与联系邮箱。</p>
      <p className="mt-3">在此之前，每条记录都以「来源 + 核验日期」标注依据；如发现错误，请先记录页面地址、问题描述与正确来源链接。</p>
    </>;
  }
  return <>
    <p>发现链接失效、信息错误或想推荐收录：请附上「页面地址 + 问题描述 + 正确来源链接」。</p>
    {feedback.issueUrl && <p className="mt-3"><a href={feedback.issueUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">在 GitHub Issues 提交</a></p>}
    {feedback.email && <p className="mt-3">联系邮箱：<a href={`mailto:${feedback.email}`} className="underline underline-offset-4 hover:text-foreground">{feedback.email}</a></p>}
  </>;
}
