import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ValidationContext } from 'sanity';
import {
  hasLocalizedPackageText,
  packageReferenceOptions,
  validatePackageReferences,
  validateRecapHighlights,
} from '@/sanity/lib/packageValidation';
import { packageType } from '@/sanity/schemaTypes/package';
import { packageServiceType } from '@/sanity/schemaTypes/packageService';
import { packageGroupType } from '@/sanity/schemaTypes/packageGroup';
import { packageComparisonSectionType } from '@/sanity/schemaTypes/sections/packageComparisonSection';
import { packagesSectionType } from '@/sanity/schemaTypes/sections/packagesSection';
import { pageType } from '@/sanity/schemaTypes/page';
import { schemaType } from '@/sanity/schemaTypes';
import { structure } from '@/sanity/structure';

vi.mock('@shared/config', () => ({
  env: { NEXT_PUBLIC_SANITY_API_VERSION: '2025-08-12' },
}));

interface Field {
  name: string;
  type: string;
  hidden?:
    | boolean
    | ((context: { parent?: { sourceType?: string } }) => boolean);
  readOnly?: boolean;
  fields?: Field[];
  of?: Field[];
  validation?: (rule: unknown) => unknown;
}

function field(schema: { fields: unknown }, name: string): Field {
  const result = (schema.fields as Field[]).find((item) => item.name === name);
  if (!result) throw new Error(`Missing field: ${name}`);
  return result;
}

function validator(target: Field) {
  const rule = {
    required: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    unique: vi.fn().mockReturnThis(),
    custom: vi.fn().mockReturnThis(),
  };
  target.validation?.(rule);
  const validate = rule.custom.mock.calls[0][0] as (
    value: unknown,
    context: ValidationContext
  ) => unknown;
  return { rule, validate };
}

const reference = (_ref: string) => ({ _type: 'reference', _ref });

function context(mode: string, documents: unknown[] = []) {
  const fetch = vi.fn().mockResolvedValue(documents);
  const client = { fetch, withConfig: vi.fn().mockReturnThis() };
  return {
    fetch,
    value: {
      document: { siteMode: mode, _id: 'drafts.package' },
      getClient: vi.fn().mockReturnValue(client),
    } as unknown as ValidationContext,
  };
}

afterEach(() => vi.restoreAllMocks());

describe('Package catalog validation', () => {
  it('requires meaningful localized content and rejects blank entered translations', () => {
    expect(hasLocalizedPackageText([{ value: 'Package' }])).toBe(true);
    for (const value of [
      undefined,
      [],
      [{ value: ' ' }],
      [{ value: 'Package' }, { value: '' }],
    ])
      expect(hasLocalizedPackageText(value)).toBe(false);
    const { rule, validate } = validator(
      field(packageComparisonSectionType, 'heading')
    );
    expect(rule.required).toHaveBeenCalledOnce();
    expect(
      validate({ heading: [{ value: 'Compare' }] }, {} as ValidationContext)
    ).toBe(true);
    expect(validate({ heading: [] }, {} as ValidationContext)).toEqual(
      expect.any(String)
    );
    expect(validate(undefined, {} as ValidationContext)).toEqual(
      expect.any(String)
    );
  });

  it.each(['production', 'wedding'])(
    'scopes reference pickers and validates %s catalog references',
    async (mode) => {
      const filter = packageReferenceOptions.filter as (
        context: unknown
      ) => unknown;
      expect(filter({ document: { siteMode: mode } })).toEqual({
        filter: expect.stringContaining('siteMode == $mode'),
        params: { mode },
      });
      expect(packageReferenceOptions.disableNew).toBe(true);
      const { fetch, value } = context(mode, [
        { _id: 'item', _type: 'packageService', siteMode: mode },
      ]);
      expect(
        await validatePackageReferences(
          [reference('item')],
          value,
          'packageService'
        )
      ).toBe(true);
      expect(fetch.mock.calls[0][1]).toEqual({ ids: ['item'] });
      expect(
        value.getClient({ apiVersion: '2025-08-12' }).withConfig
      ).toHaveBeenCalledWith({ useCdn: false, perspective: 'published' });
    }
  );

  it('rejects incomplete, duplicate, and draft/published duplicate references without a request', async () => {
    const { fetch, value } = context('wedding');
    for (const entries of [
      undefined,
      [],
      [{}],
      [reference('same'), reference('same')],
      [reference('same'), reference('drafts.same')],
    ])
      expect(
        await validatePackageReferences(entries, value, 'package')
      ).toEqual(expect.any(String));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects absent mode, missing targets, wrong types, and cross-mode references', async () => {
    for (const documents of [
      [],
      [{ _id: 'target', _type: 'project', siteMode: 'wedding' }],
      [{ _id: 'target', _type: 'package', siteMode: 'production' }],
      [{ _id: 'drafts.target', _type: 'package', siteMode: 'wedding' }],
      [
        {
          _id: 'versions.release.target',
          _type: 'package',
          siteMode: 'wedding',
        },
      ],
    ]) {
      expect(
        await validatePackageReferences(
          [reference('target')],
          context('wedding', documents).value,
          'package'
        )
      ).toEqual(expect.any(String));
    }
    const unknownMode = context('both');
    expect(
      await validatePackageReferences(
        [reference('target')],
        unknownMode.value,
        'package'
      )
    ).toEqual(expect.any(String));
    expect(unknownMode.fetch).not.toHaveBeenCalled();
  });

  it('uses the published target even when a draft exists and blocks publication when validation is unavailable', async () => {
    const target = context('wedding', [
      { _id: 'target', _type: 'package', siteMode: 'wedding' },
      { _id: 'drafts.target', _type: 'package', siteMode: 'production' },
    ]);
    expect(
      await validatePackageReferences(
        [reference('target')],
        target.value,
        'package'
      )
    ).toBe(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    target.fetch.mockRejectedValueOnce(new Error('fixture outage'));
    expect(
      await validatePackageReferences(
        [reference('target')],
        target.value,
        'package'
      )
    ).toEqual(expect.any(String));
    expect(console.error).toHaveBeenCalledWith(
      '[Package Catalog Validation]',
      expect.any(Error)
    );
  });

  it('allows automatic highlights or an ordered unique subset of included published services', async () => {
    const target = context(
      'wedding',
      ['one', 'two'].map((_id) => ({
        _id,
        _type: 'packageService',
        siteMode: 'wedding',
      }))
    );
    expect(await validateRecapHighlights(undefined, target.value)).toBe(true);
    expect(await validateRecapHighlights([], target.value)).toBe(true);
    target.fetch
      .mockResolvedValueOnce(
        ['one', 'two'].map((_id) => ({
          _id,
          _type: 'packageService',
          siteMode: 'wedding',
        }))
      )
      .mockResolvedValueOnce(['one', 'two']);
    expect(
      await validateRecapHighlights(
        [reference('two'), reference('one')],
        target.value
      )
    ).toBe(true);
    expect(target.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining('$packageId in packages[]._ref'),
      { ids: ['two', 'one'], mode: 'wedding', packageId: 'package' }
    );
    for (const highlights of [
      [reference('three')],
      [reference('one'), reference('one')],
      [{}],
    ])
      expect(await validateRecapHighlights(highlights, target.value)).toEqual(
        expect.any(String)
      );
    target.fetch
      .mockResolvedValueOnce(
        ['one', 'two'].map((_id) => ({
          _id,
          _type: 'packageService',
          siteMode: 'wedding',
        }))
      )
      .mockResolvedValueOnce(['one']);
    expect(
      await validateRecapHighlights([reference('two')], target.value)
    ).toEqual(expect.any(String));
    expect(await validateRecapHighlights('bad', target.value)).toEqual(
      expect.any(String)
    );
  });

  it('validates only the selected recap source and counts that source in preview', async () => {
    const selected = validator(field(packagesSectionType, 'selectedPackages'));
    const target = context('production', [
      { _id: 'package', _type: 'package', siteMode: 'production' },
    ]);
    const catalogContext = {
      ...target.value,
      parent: { sourceType: 'catalog' },
    } as ValidationContext;
    expect(
      await selected.validate(
        [{ packageRef: reference('package') }],
        catalogContext
      )
    ).toBe(true);
    expect(await selected.validate([], catalogContext)).toEqual(
      expect.any(String)
    );
    expect(
      await selected.validate(undefined, {
        ...target.value,
        parent: {},
      } as ValidationContext)
    ).toBe(true);
    const inline = validator(field(packagesSectionType, 'packages'));
    expect(inline.validate([], catalogContext)).toBe(true);
    expect(
      inline.validate([], { ...target.value, parent: {} } as ValidationContext)
    ).toEqual(expect.any(String));
    expect(
      inline.validate(undefined, {
        ...target.value,
        parent: {},
      } as ValidationContext)
    ).toBe(true);
    expect(
      packagesSectionType.preview?.prepare?.({
        title: 'Cards',
        sourceType: 'catalog',
        packages: [{}, {}],
        selectedPackages: [{}],
        background: undefined,
      })
    ).toMatchObject({ subtitle: 'Catalog · 1 package' });
  });

  it('requires Service membership and Group packages while allowing automatic rows and independent Packages', async () => {
    const groups = field(packageComparisonSectionType, 'groups');
    expect(groups.of?.[0].type).toBe('reference');
    for (const schema of [packageServiceType, packageGroupType]) {
      const { rule, validate } = validator(field(schema, 'packages'));
      expect(rule.required).toHaveBeenCalledOnce();
      expect(rule.min).toHaveBeenCalledWith(1);
      expect(rule.unique).toHaveBeenCalledOnce();
      expect(await validate([], context('wedding').value)).toEqual(
        expect.any(String)
      );
    }
    expect(
      (packageType.fields as Field[]).some((item) => item.name === 'services')
    ).toBe(false);
    expect(
      (packageGroupType.fields as Field[]).some(
        (item) => item.name === 'rows' || item.name === 'sortOrder'
      )
    ).toBe(false);
    expect(field(packageGroupType, 'serviceOrder').validation).toBeDefined();
    expect(
      await validator(field(packageType, 'recapHighlights')).validate(
        undefined,
        context('wedding').value
      )
    ).toBe(true);
    for (const schema of [packageType, packageServiceType, packageGroupType]) {
      const mode = field(schema, 'siteMode');
      expect(mode.hidden).toBe(true);
      expect(mode.readOnly).toBe(true);
      const { validate } = validator(mode);
      expect(validate('both', {} as ValidationContext)).toEqual(
        expect.any(String)
      );
    }
  });
});

describe('Package catalog Studio registration', () => {
  it('registers comparison in both page builders and provides only mode-specific catalog templates', () => {
    expect(schemaType.types).toContain(packageGroupType);
    for (const name of ['commercialSections', 'weddingSections'])
      expect(field(pageType, name).of?.map((item) => item.type)).toContain(
        'packageComparisonSection'
      );
    const templates = schemaType.templates([
      { id: 'package', title: 'Default', schemaType: 'package', value: {} },
      {
        id: 'packageService',
        title: 'Default',
        schemaType: 'packageService',
        value: {},
      },
      {
        id: 'packageGroup',
        title: 'Default',
        schemaType: 'packageGroup',
        value: {},
      },
    ]);
    expect(
      templates.some((item) =>
        ['package', 'packageService', 'packageGroup'].includes(item.id)
      )
    ).toBe(false);
    for (const mode of ['production', 'wedding']) {
      expect(
        templates.find((item) => item.id === `${mode}-packages`)
      ).toMatchObject({ schemaType: 'package', value: { siteMode: mode } });
      expect(
        templates.find((item) => item.id === `${mode}-package-services`)
      ).toMatchObject({
        schemaType: 'packageService',
        value: { siteMode: mode },
      });
      expect(
        templates.find((item) => item.id === `${mode}-package-groups`)
      ).toMatchObject({
        schemaType: 'packageGroup',
        value: { siteMode: mode },
      });
    }
  });

  it('exposes filtered catalog menus without unfiltered duplicates', () => {
    class Node {
      values: Record<string, unknown> = {};
      title(value: unknown) {
        this.values.title = value;
        return this;
      }
      id(value: unknown) {
        this.values.id = value;
        return this;
      }
      items(value: unknown) {
        this.values.items = value;
        return this;
      }
      child(value: unknown) {
        this.values.child = value;
        return this;
      }
      schemaType(value: unknown) {
        this.values.schemaType = value;
        return this;
      }
      documentId(value: unknown) {
        this.values.documentId = value;
        return this;
      }
      filter(value: unknown) {
        this.values.filter = value;
        return this;
      }
      params(value: unknown) {
        this.values.params = value;
        return this;
      }
      apiVersion(value: unknown) {
        this.values.apiVersion = value;
        return this;
      }
      initialValueTemplates(value: unknown) {
        this.values.templates = value;
        return this;
      }
      getId() {
        return this.values.id;
      }
    }
    const builder = {
      list: () => new Node(),
      listItem: () => new Node(),
      document: () => new Node(),
      documentList: () => new Node(),
      divider: () => new Node(),
      initialValueTemplateItem: (id: string) => id,
      documentTypeListItems: () =>
        [
          'settings',
          'page',
          'projectTag',
          'package',
          'packageService',
          'packageGroup',
          'project',
        ].map((id) => new Node().id(id)),
    };
    const root = structure(builder as never, {} as never) as Node;
    const entries = root.values.items as Node[];
    expect(entries.map((entry) => entry.getId())).not.toContain('package');
    expect(entries.map((entry) => entry.getId())).not.toContain(
      'packageService'
    );
    expect(entries.map((entry) => entry.getId())).not.toContain('packageGroup');
    for (const mode of ['production', 'wedding']) {
      for (const [suffix, type] of [
        ['packages', 'package'],
        ['package-services', 'packageService'],
        ['package-groups', 'packageGroup'],
      ]) {
        const entry = entries.find(
          (item) => item.getId() === `${mode}-${suffix}`
        );
        expect((entry?.values.child as Node).values).toMatchObject({
          filter: `_type == $type && siteMode == "${mode}"`,
          params: { type },
          templates: [`${mode}-${suffix}`],
        });
      }
    }
  });
});
