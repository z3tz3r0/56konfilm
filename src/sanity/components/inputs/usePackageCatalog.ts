'use client';

import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { PACKAGE_CATALOG_API_VERSION } from '../../lib/packageCatalog';
import { PUBLISHED_CATALOG_FILTER } from '../../lib/queries/packageCatalog';

export interface CatalogEntry {
  _id: string;
  _createdAt?: string;
  title?: Array<{ value?: string }>;
}

export function catalogEntryLabel(entry: CatalogEntry) {
  return entry.title?.find((item) => item.value?.trim())?.value ?? entry._id;
}

/** Published catalog updates affect the view only; loading never patches a form. */
export function usePackageCatalog(
  query: string,
  params: Record<string, unknown>,
  documentTypes: string[]
) {
  const studioClient = useClient({ apiVersion: PACKAGE_CATALOG_API_VERSION });
  const client = useMemo(
    () => studioClient.withConfig({ useCdn: false, perspective: 'published' }),
    [studioClient]
  );
  const paramsKey = JSON.stringify(params);
  const typesKey = JSON.stringify(documentTypes);
  const key = JSON.stringify([query, paramsKey, typesKey]);
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<{
    key: string;
    entries: CatalogEntry[];
    error: boolean;
  }>({ key: '', entries: [], error: false });
  const validMode = params.mode === 'production' || params.mode === 'wedding';

  useEffect(() => {
    if (!validMode) return;
    let disposed = false;
    let request = 0;
    const reportError = () => {
      if (!disposed)
        setState((previous) => ({
          key,
          entries: previous.key === key ? previous.entries : [],
          error: true,
        }));
    };
    async function refresh() {
      const currentRequest = ++request;
      try {
        const entries = await client.fetch<CatalogEntry[]>(
          query,
          JSON.parse(paramsKey)
        );
        if (!disposed && currentRequest === request)
          setState({ key, entries, error: false });
      } catch {
        if (currentRequest === request) reportError();
      }
    }

    const subscription = client
      .withConfig({ perspective: 'raw' })
      .listen(
        `*[_type in $types && ${PUBLISHED_CATALOG_FILTER}]`,
        { types: JSON.parse(typesKey) },
        { includeResult: false, events: ['welcome', 'mutation', 'reconnect'] }
      )
      .subscribe({
        next: () => void refresh(),
        error: () => {
          ++request;
          reportError();
        },
      });
    void refresh();
    return () => {
      disposed = true;
      ++request;
      subscription.unsubscribe();
    };
  }, [client, key, paramsKey, query, retryCount, typesKey, validMode]);

  return {
    entries: state.key === key && validMode ? state.entries : [],
    loading: validMode && state.key !== key,
    error: !validMode || (state.key === key && state.error),
    retry: () => setRetryCount((count) => count + 1),
  };
}
