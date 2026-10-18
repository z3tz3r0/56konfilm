import {
  at,
  create,
  patch,
  set,
  transaction,
  type AsyncIterableMigration,
  type NodePatch,
} from 'sanity/migrate';

// Only this migration (and its fixtures) retains the retired stored type.
const SOURCE_TYPE = 'logoGridSection';
const TARGET_TYPE = 'logoShowcaseSection';
const SECTION_FIELDS = ['commercialSections', 'weddingSections'] as const;
const LIVE_REVISIONS_QUERY = '*[_id in $ids]{_id, _rev}';

export interface PageSnapshot {
  _id: string;
  _type: string;
  _rev: string;
  [field: string]: unknown;
}

export interface LogoShowcaseMigrationPlan {
  source: PageSnapshot;
  targetId: string;
  patches: NodePatch[];
}

/** An operator-facing error that never includes SDK responses or credentials. */
export class LogoShowcaseMigrationError extends Error {}

/** Collect unambiguous, keyed type changes without modifying the source page. */
function sectionChanges(page: PageSnapshot) {
  const patches: NodePatch[] = [];
  for (const field of SECTION_FIELDS) {
    const sections = page[field];
    if (!Array.isArray(sections)) continue;
    for (const section of sections) {
      if (section?._type !== SOURCE_TYPE) continue;
      const key = section._key;
      if (
        typeof key !== 'string' ||
        !key.trim() ||
        sections.filter((item) => item?._key === key).length !== 1
      ) {
        throw new LogoShowcaseMigrationError(
          `Ambiguous or missing section key in ${page._id}.${field}; fix it in Studio before migrating.`
        );
      }
      patches.push(at([field, { _key: key }, '_type'], set(TARGET_TYPE)));
    }
  }
  return patches;
}

/**
 * The native runner always enables autoGenerateArrayKeys. Refuse an unsafe
 * draft copy instead of allowing it to silently repair unrelated array data.
 * Existing drafts only receive string patches, so their other arrays are not
 * copied or rewritten and do not need this additional copy-specific check.
 */
function assertCopyPreservesArrayKeys(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    const keys = new Set<string>();
    value.forEach((item, index) => {
      const itemPath = `${path}[${index}]`;
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        const key = (item as Record<string, unknown>)._key;
        if (typeof key !== 'string' || !key.trim() || keys.has(key)) {
          throw new LogoShowcaseMigrationError(
            `Missing or duplicate array item key at ${itemPath}; fix it in Studio before creating a draft copy.`
          );
        }
        keys.add(key);
      }
      assertCopyPreservesArrayKeys(item, itemPath);
    });
  } else if (value !== null && typeof value === 'object') {
    for (const [field, child] of Object.entries(value)) {
      assertCopyPreservesArrayKeys(child, `${path}.${field}`);
    }
  }
}

/** Prefer existing drafts, including drafts that remove or already rename logos. */
export function planLogoShowcaseMigration(pages: PageSnapshot[]) {
  const sources = new Map<string, PageSnapshot>();
  for (const page of pages) {
    if (page._type !== 'page' || page._id.startsWith('versions.')) continue;
    const isDraft = page._id.startsWith('drafts.');
    const publishedId = isDraft ? page._id.slice('drafts.'.length) : page._id;
    if (isDraft || !sources.has(publishedId)) sources.set(publishedId, page);
  }

  const plans: LogoShowcaseMigrationPlan[] = [];
  for (const [publishedId, source] of sources) {
    const patches = sectionChanges(source);
    if (!patches.length) continue;
    if (!source._rev) {
      throw new LogoShowcaseMigrationError(
        `Missing revision for ${source._id}; refusing an unguarded migration.`
      );
    }
    const targetId = `drafts.${publishedId}`;
    if (source._id !== targetId) {
      assertCopyPreservesArrayKeys(source, source._id);
    }
    plans.push({ source, targetId, patches });
  }
  return plans;
}

/**
 * Yield declarations only: Sanity's runner owns dry-run, commits, and progress.
 * Collect all snapshots before planning so a draft always wins over published
 * content, even if its logos were removed or already migrated. No mutation is
 * yielded until every plan has passed validation.
 */
export const migrateLogoShowcase: AsyncIterableMigration = async function* (
  documents,
  context
) {
  const pages: PageSnapshot[] = [];
  for await (const document of documents()) pages.push(document);
  const plans = planLogoShowcaseMigration(pages);

  for (const { source, targetId, patches } of plans) {
    if (source._id === targetId) {
      yield transaction([
        patch(targetId, patches, { ifRevision: source._rev }),
      ]);
      continue;
    }

    // Dry-runs use only the supplied snapshot, including --from-export. During
    // apply, recheck live content before declaring a strict draft creation.
    // This uncached GROQ read is a preflight check, not an atomic lock; the query
    // index can lag recent writes. Avoid concurrent editing and review drafts.
    if (!context.dryRun) {
      // The installed runner's Proxy does not bind getDocuments() to its SDK
      // instance (#httpRequest fails). fetch() is safely forwarded by its limiter.
      // Raw perspective keeps drafts visible even with a published client default.
      const current = await context.client.fetch<
        Array<Pick<PageSnapshot, '_id' | '_rev'>>
      >(
        LIVE_REVISIONS_QUERY,
        { ids: [source._id, targetId] },
        { perspective: 'raw', useCdn: false }
      );
      const published = current.find((page) => page._id === source._id);
      const draft = current.find((page) => page._id === targetId);
      if (draft || !published || published._rev !== source._rev) {
        throw new LogoShowcaseMigrationError(
          `Content changed for ${source._id}; review it and rerun the dry-run.`
        );
      }
    }
    const copy: Record<string, unknown> & { _id: string; _type: string } = {
      ...source,
      _id: targetId,
    };
    delete copy._rev;
    delete copy._createdAt;
    delete copy._updatedAt;

    // Keep creation and keyed changes atomic. Strict create fails if someone
    // creates this draft after the recheck; never overwrite that draft instead.
    yield transaction([create(copy), patch(targetId, patches)]);
  }
};
