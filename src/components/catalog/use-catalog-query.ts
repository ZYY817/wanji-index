'use client';
import { useEffect, useState } from 'react';
export function useCatalogQuery() {
  const [query, setQuery] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => setQuery(Object.fromEntries(new URLSearchParams(window.location.search)));
    read(); window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const update = (values: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(values).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    const suffix = params.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (suffix ? '?' + suffix : '') + window.location.hash);
    setQuery(Object.fromEntries(params));
  };
  return { query, update };
}

