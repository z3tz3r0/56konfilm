import {
  insert,
  setIfMissing,
  unset,
  type FormPatch,
  type Reference,
} from 'sanity';

export const PACKAGE_CATALOG_API_VERSION = '2025-08-12';

/** Reads a nonempty reference ID and removes its draft prefix, returning undefined otherwise. */
export function catalogReferenceId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('_ref' in value)) return;
  return typeof value._ref === 'string' && value._ref.trim()
    ? value._ref.replace(/^drafts\./, '')
    : undefined;
}

/** Extracts valid catalog IDs from a reference array, returning an empty array for other values. */
export function catalogReferenceIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value.flatMap((entry) => {
        const id = catalogReferenceId(entry);
        return id ? [id] : [];
      })
    : [];
}

/** Stored order never controls membership; newly eligible services append. */
export function orderedCatalogServices<
  T extends { _id: string; _createdAt?: string },
>(services: T[], serviceOrder: unknown): T[] {
  const sorted = [...services].sort((left, right) => {
    for (const field of ['_createdAt', '_id'] as const) {
      const a = left[field] ?? '';
      const b = right[field] ?? '';
      if (a !== b) return a < b ? -1 : 1;
    }
    return 0;
  });
  const byId = new Map(sorted.map((service) => [service._id, service]));
  const ids = [
    ...new Set([...catalogReferenceIds(serviceOrder), ...byId.keys()]),
  ];
  return ids.flatMap((id) => {
    const service = byId.get(id);
    return service ? [service] : [];
  });
}

/** Creates a Sanity reference with a fresh key and optional weak reference semantics. */
export function newCatalogReference(id: string, weak = false): Reference {
  return {
    _type: 'reference',
    _key: crypto.randomUUID().replaceAll('-', ''),
    _ref: id,
    ...(weak ? { _weak: true } : {}),
  };
}

/** Insert/remove by stable keys rather than replacing concurrent form edits. */
export function toggleCatalogReference(
  value: Reference[] | undefined,
  id: string,
  checked: boolean
) {
  const matching = (value ?? []).filter(
    (reference) => catalogReferenceId(reference) === id
  );
  if (checked)
    return matching.length
      ? []
      : [setIfMissing([]), insert([newCatalogReference(id)], 'after', [-1])];
  return matching.flatMap((reference) =>
    reference._key ? [unset([{ _key: reference._key }])] : []
  );
}

/** Materialize derived entries only after a move; preserve keys when possible. */
export function reorderCatalogReferences(
  value: Reference[] | undefined,
  ids: string[]
) {
  const current = value ?? [];
  const references = ids.map(
    (id) =>
      current.find(
        (reference) => catalogReferenceId(reference) === id && reference._key
      ) ?? newCatalogReference(id, true)
  );
  const patches: FormPatch[] = [setIfMissing([])];
  // Delete only known keys; a concurrently inserted entry is not overwritten.
  for (const reference of current)
    if (reference._key) patches.push(unset([{ _key: reference._key }]));
  if (references.length) patches.push(insert(references, 'before', [0]));
  return patches;
}
