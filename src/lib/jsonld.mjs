// JSON-LD 构建 —— docs/06 §8 五类：VideoGame/SoftwareApplication/HowTo/WebSite/BreadcrumbList
// 铁律：只填有数据支撑的字段，不虚构 aggregateRating/offers/version 等

export function webSiteLd(site, baseUrl) {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: site.name, url: baseUrl,
    potentialAction: { '@type': 'SearchAction', target: `${baseUrl}search/?q={query}`, 'query-input': 'required name=query' },
  };
}

export function breadcrumbLd(trail, baseUrl) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: baseUrl + path,
    })),
  };
}

export function videoGameLd(g, baseUrl) {
  const ld = {
    '@context': 'https://schema.org', '@type': 'VideoGame',
    name: g.name.zh, alternateName: g.name.en, description: g.summary,
    url: baseUrl + `/games/${g.slug}/`,
    ...(g.genres?.length && { genre: g.genres }),
    ...(g.os?.length && { operatingSystem: g.os.join(', ') }),
  };
  return ld;
}

export function softwareAppLd(t, baseUrl) {
  const ld = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name: t.name, description: t.summary,
    url: baseUrl + `/tools/${t.slug}/`,
    ...(t.officialUrl && { downloadUrl: t.officialUrl }),
    ...(t.os?.length && { operatingSystem: t.os.join(', ') }),
    applicationCategory: 'GameApplication',
  };
  return ld;
}

export function howToLd(g, baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': g.kind === 'troubleshooting' ? 'Article' : 'HowTo',
    headline: g.title, description: g.problem?.description ?? g.title,
    url: baseUrl + `/guides/${g.slug}/`,
    dateModified: g.updatedAt,
    ...(g.kind !== 'troubleshooting' && {
      step: g.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title ?? `步骤 ${i + 1}`, text: `${s.action}（预期：${s.expected}）` })),
    }),
  };
}
