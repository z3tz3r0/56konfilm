import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createSchema,
  validateDocument,
  type SanityDocument,
  type SlugValidationContext,
  type Workspace,
} from 'sanity';
import {
  isPackageGroupSlugUnique,
  packageGroupSlugSource,
  validatePackageGroupSlug,
} from '@/sanity/lib/packageGroupSlug';
import { packageGroupType } from '@/sanity/schemaTypes/packageGroup';

const requireFromSanity = createRequire(
  createRequire(import.meta.url).resolve('sanity')
);
const { parse, evaluate } = requireFromSanity('groq-js') as {
  parse: (
    query: string,
    options: { params: Record<string, unknown> }
  ) => unknown;
  evaluate: (
    query: unknown,
    options: { dataset: unknown[]; params: Record<string, unknown> }
  ) => Promise<{ get: () => Promise<unknown> }>;
};
const slugField = packageGroupType.fields.find(
  (field) => field.name === 'slug'
)!;
const options = slugField.options as {
  source: typeof packageGroupSlugSource;
  slugify: (input: string) => string;
  isUnique: typeof isPackageGroupSlugUnique;
};
const schema = createSchema({
  name: 'slug-fixture',
  types: [{ name: 'packageGroup', type: 'document', fields: [slugField] }],
});
/** Creates a package group document fixture with a configurable site mode and ID. */
const document = (
  siteMode = 'wedding',
  _id = 'drafts.group'
): SanityDocument => ({
  _id,
  _type: 'packageGroup',
  _rev: 'fixture-revision',
  _createdAt: '2026-01-01T00:00:00Z',
  _updatedAt: '2026-01-01T00:00:00Z',
  siteMode,
});
/** Creates a slug validation context whose mocked client evaluates GROQ against a fixture dataset. */
function context(doc = document(), dataset: unknown[] = []) {
  const fetch = vi.fn(async (query: string, params: Record<string, unknown>) =>
    (await evaluate(parse(query, { params }), { params, dataset })).get()
  );
  const client = { fetch, withConfig: vi.fn().mockReturnThis() };
  const getClient = vi.fn(() => client);
  return {
    fetch,
    client,
    getClient,
    value: { document: doc, getClient } as unknown as SlugValidationContext,
  };
}
/** Runs native Sanity document validation with the supplied slug and fixture workspace. */
async function nativeValidation(value: unknown, target = context()) {
  const workspace = {
    schema,
    getClient: target.getClient,
    i18n: { loadNamespaces: async () => {}, t: (key: string) => key },
  } as unknown as Workspace;
  return validateDocument({
    document: {
      ...target.value.document!,
      ...(value === undefined ? {} : { slug: value }),
    },
    workspace,
    getDocumentExists: async () => true,
  });
}
/** Selects error markers attached to the slug field from native validation results. */
const atSlug = (markers: Awaited<ReturnType<typeof nativeValidation>>) =>
  markers.filter(
    (marker) => marker.path[0] === 'slug' && marker.level === 'error'
  );

afterEach(() => vi.restoreAllMocks());

describe('Required native Package Group URL slug', () => {
  it.each([undefined, null, {}, { current: '' }, { current: '  ' }])(
    'blocks Publish for a missing or blank slug (%j)',
    async (value) => {
      expect(validatePackageGroupSlug(value)).toEqual(expect.any(String));
      expect(atSlug(await nativeValidation(value)).length).toBeGreaterThan(0);
    }
  );

  it.each([
    'Budget-Friendly',
    'budget friendly',
    'ราคา-ประหยัด',
    '-budget',
    'budget-',
    'budget--friendly',
    'budget/friendly',
    'a'.repeat(97),
  ])(
    'blocks malformed or oversized manually entered slug %s',
    async (current) => {
      expect(validatePackageGroupSlug({ current })).toEqual(expect.any(String));
      expect(
        atSlug(await nativeValidation({ _type: 'slug', current })).length
      ).toBeGreaterThan(0);
    }
  );

  it.each(['budget-friendly', 'package-2026', 'a'.repeat(96)])(
    'allows valid required slug %s with no conflicts',
    async (current) => {
      expect(validatePackageGroupSlug({ current })).toBe(true);
      expect(
        atSlug(await nativeValidation({ _type: 'slug', current }))
      ).toEqual([]);
    }
  );

  it('uses the English label for explicit native generation and does not mutate label/slug', () => {
    const doc = {
      ...document(),
      label: [
        { _key: 'th', language: 'th', value: 'ราคาประหยัด' },
        { _key: 'en', language: 'en', value: 'Budget Friendly' },
      ],
      slug: { _type: 'slug', current: 'keep-this-url' },
    };
    const before = structuredClone(doc);
    expect(slugField.type).toBe('slug');
    expect(options.source).toBe(packageGroupSlugSource);
    expect(options.isUnique).toBe(isPackageGroupSlugUnique);
    expect(options.slugify(options.source(doc))).toBe('budget-friendly');
    expect(doc).toEqual(before);
    expect(
      options.source({ ...doc, label: [{ _key: 'en', value: 'English Key' }] })
    ).toBe('English Key');
    expect(
      options.source({ ...doc, label: [{ language: 'th', value: 'ภาษาไทย' }] })
    ).toBe('');
    expect(options.source({ ...doc, label: undefined })).toBe('');
    const longGenerated = options.slugify(`${'a'.repeat(95)} long name`);
    expect(validatePackageGroupSlug({ current: longGenerated })).toBe(true);
  });
});

describe('Mode-scoped Group slug uniqueness with in-memory Content Lake', () => {
  for (const mode of ['production', 'wedding']) {
    it.each(['other', 'drafts.other'])(
      `blocks a duplicate ${mode} Group slug in %s`,
      async (_id) => {
        const duplicate = {
          ...document(mode, _id),
          slug: { _type: 'slug', current: 'budget-friendly' },
        };
        const target = context(document(mode), [duplicate]);
        expect(
          await isPackageGroupSlugUnique('budget-friendly', target.value)
        ).toBe(false);
        expect(target.getClient).toHaveBeenCalledWith({
          apiVersion: '2025-08-12',
        });
        expect(target.client.withConfig).toHaveBeenCalledWith({
          useCdn: false,
          perspective: 'raw',
        });
        expect(
          atSlug(
            await nativeValidation(
              { _type: 'slug', current: 'budget-friendly' },
              target
            )
          ).length
        ).toBeGreaterThan(0);
      }
    );

    it(`allows ${mode} slugs used in the other mode or a different document type, and ignores release versions`, async () => {
      const target = context(document(mode), [
        {
          ...document(mode === 'wedding' ? 'production' : 'wedding', 'other'),
          slug: { current: 'budget-friendly' },
        },
        {
          ...document(mode, 'page'),
          _type: 'page',
          slug: { current: 'budget-friendly' },
        },
        {
          ...document(mode, 'versions.release.other'),
          slug: { current: 'budget-friendly' },
        },
      ]);
      expect(
        await isPackageGroupSlugUnique('budget-friendly', target.value)
      ).toBe(true);
      expect(
        atSlug(
          await nativeValidation(
            { _type: 'slug', current: 'budget-friendly' },
            target
          )
        )
      ).toEqual([]);
    });
  }

  it.each(['group', 'drafts.group', 'versions.release.group'])(
    'excludes its own published/draft pair while validating %s',
    async (_id) => {
      const target = context(
        document('wedding', _id),
        ['group', 'drafts.group'].map((id) => ({
          ...document('wedding', id),
          slug: { current: 'budget-friendly' },
        }))
      );
      expect(
        await isPackageGroupSlugUnique('budget-friendly', target.value)
      ).toBe(true);
      expect(target.fetch.mock.calls[0][1]).toEqual({
        slug: 'budget-friendly',
        mode: 'wedding',
        excludedIds: ['group', 'drafts.group'],
      });
    }
  );

  it('fails closed on a query outage or unusable response and returns a native error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const target = context();
    target.fetch.mockRejectedValue(new Error('fixture outage'));
    expect(
      await isPackageGroupSlugUnique('budget-friendly', target.value)
    ).toBe(false);
    expect(
      atSlug(
        await nativeValidation(
          { _type: 'slug', current: 'budget-friendly' },
          target
        )
      ).length
    ).toBeGreaterThan(0);
    expect(console.error).toHaveBeenCalledWith(
      '[Package Group Slug Validation]',
      expect.any(Error)
    );
    target.fetch.mockResolvedValue(undefined);
    expect(
      await isPackageGroupSlugUnique('budget-friendly', target.value)
    ).toBe(false);
  });

  it('does not query without a valid slug, document identity or site mode', async () => {
    const target = context();
    expect(await isPackageGroupSlugUnique('invalid slug', target.value)).toBe(
      false
    );
    const noId = context(document('wedding', ''));
    expect(await isPackageGroupSlugUnique('budget-friendly', noId.value)).toBe(
      false
    );
    const noMode = context(document('both'));
    expect(
      await isPackageGroupSlugUnique('budget-friendly', noMode.value)
    ).toBe(false);
    expect(target.fetch).not.toHaveBeenCalled();
    expect(noId.fetch).not.toHaveBeenCalled();
    expect(noMode.fetch).not.toHaveBeenCalled();
  });
});
