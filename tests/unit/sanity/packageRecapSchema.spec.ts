import { describe, expect, it, vi } from 'vitest';
import type { Path, SanityDocument } from 'sanity';
import { ctaStyleField, ctaType } from '@/sanity/schemaTypes/objects/cta';
import { packageItemType } from '@/sanity/schemaTypes/objects/packageItem';
import { packageType } from '@/sanity/schemaTypes/package';
import { packagesSectionType } from '@/sanity/schemaTypes/sections/packagesSection';

vi.mock('@shared/config', () => ({
  env: { NEXT_PUBLIC_SANITY_API_VERSION: '2025-08-12' },
}));

interface SchemaField {
  name: string;
  type: string;
  title?: string;
  description?: string;
  fields?: SchemaField[];
  of?: SchemaField[];
  validation?: (rule: unknown) => unknown;
}

/** Find a schema field by name, throwing if the expected field is missing. */
function field(schema: { fields?: unknown }, name: string): SchemaField {
  const result = (schema.fields as SchemaField[] | undefined)?.find(
    (item) => item.name === name
  );
  if (!result) throw new Error(`Missing schema field: ${name}`);
  return result;
}

/** Build a page fixture with configurable section storage, source, and section type. */
function pageDocument(
  sections: string,
  sourceType?: string,
  sectionType = 'packagesSection'
): SanityDocument {
  return {
    _id: 'page',
    _type: 'page',
    _rev: 'fixture',
    _createdAt: '2026-01-01T00:00:00Z',
    _updatedAt: '2026-01-01T00:00:00Z',
    [sections]: [
      { _key: 'other', _type: 'ctaBannerSection' },
      {
        _key: 'recap',
        _type: sectionType,
        sourceType,
        packages: [
          {
            _key: 'card',
            _type: 'packageItem',
            featured: true,
            cta: { _type: 'cta', style: 'link' },
          },
        ],
      },
    ],
  };
}

/** Return the keyed path to the fixture's manual recap CTA style field. */
function recapStylePath(sections: string): Path {
  return [
    sections,
    { _key: 'recap' },
    'packages',
    { _key: 'card' },
    'cta',
    'style',
  ];
}

/** Evaluate the real CTA style visibility callback with the supplied document and path. */
function isStyleHidden(document?: SanityDocument, path?: Path) {
  const hidden = ctaStyleField.hidden;
  if (typeof hidden !== 'function')
    throw new Error('Missing CTA style condition');
  return hidden({
    document,
    path,
    currentUser: null,
    value: 'link',
  } as Parameters<typeof hidden>[0]);
}

/** Run the manual package preview callback, failing if the schema omits it. */
function prepareManualPackagePreview(selection: Record<string, unknown> = {}) {
  const prepare = packageItemType.preview?.prepare;
  if (!prepare) throw new Error('Missing manual package preview');
  return prepare(selection);
}

describe('Manual package item preview', () => {
  it('selects only the existing summary fields without fetching CTA data', () => {
    expect(packageItemType.preview?.select).toEqual({
      title: 'title',
      price: 'price',
      currency: 'currency',
      features: 'features',
      featured: 'featured',
    });
  });

  it('summarizes a highlighted package without rewriting the stored values', () => {
    const selection = {
      title: [{ _key: 'en', value: '  Most Popular Package  ' }],
      price: 99000,
      currency: '  THB  ',
      features: ['Ceremony', 'Reception', 'Highlight film'],
      featured: true,
    };
    const original = structuredClone(selection);
    expect(prepareManualPackagePreview(selection)).toEqual({
      title: 'Most Popular Package',
      subtitle: '99,000 THB · 3 รายการ · Highlight',
    });
    expect(selection).toEqual(original);
  });

  it.each([
    { title: [{ _key: 'en', value: 'Starter' }], expected: 'Starter' },
    {
      title: [{ _key: 'th', value: 'แพ็กเกจเริ่มต้น' }],
      expected: 'แพ็กเกจเริ่มต้น',
    },
    {
      title: [
        { _key: 'en', value: ' \n ' },
        { _key: 'th', value: '  แพ็กเกจแนะนำ  ' },
      ],
      expected: 'แพ็กเกจแนะนำ',
    },
    {
      title: [
        { _key: 'th', value: 'ชื่อแรก' },
        { _key: 'en', value: 'Second name' },
      ],
      expected: 'ชื่อแรก',
    },
  ])(
    'uses the first nonblank localized name ($expected)',
    ({ title, expected }) => {
      expect(prepareManualPackagePreview({ title }).title).toBe(expected);
    }
  );

  it.each([undefined, null, [], [{ value: ' ' }], [null, {}]])(
    'shows an honest placeholder for a missing name (%j)',
    (title) => {
      expect(prepareManualPackagePreview({ title }).title).toBe(
        'ยังไม่ระบุชื่อแพ็กเกจ'
      );
    }
  );

  it.each([
    { price: 0, expected: '0' },
    { price: 99000, expected: '99,000' },
    { price: 1200.5, expected: '1,200.5' },
    { price: 1234.56789, expected: '1,234.56789' },
  ])('preserves zero and decimal prices ($price)', ({ price, expected }) => {
    expect(
      prepareManualPackagePreview({ price, currency: 'USD' }).subtitle
    ).toBe(`${expected} USD · 0 รายการ`);
  });

  it.each([undefined, null, Number.NaN, Number.POSITIVE_INFINITY, '99000'])(
    'does not invent a price for incomplete or invalid input (%j)',
    (price) => {
      expect(prepareManualPackagePreview({ price }).subtitle).toBe(
        'ยังไม่ระบุราคา · 0 รายการ'
      );
    }
  );

  it.each([undefined, null, '', ' \t '])(
    'does not invent a currency when it is missing (%j)',
    (currency) => {
      expect(
        prepareManualPackagePreview({ price: 99000, currency }).subtitle
      ).toBe('99,000 · 0 รายการ');
    }
  );

  it('counts only entered details and omits Highlight when it is disabled', () => {
    expect(
      prepareManualPackagePreview({
        price: 15000,
        currency: 'THB',
        features: ['Ceremony', '', ' \n ', null, 'Reception'],
        featured: false,
      }).subtitle
    ).toBe('15,000 THB · 2 รายการ');
  });

  it('handles an entirely incomplete card without undefined text or empty separators', () => {
    expect(prepareManualPackagePreview()).toEqual({
      title: 'ยังไม่ระบุชื่อแพ็กเกจ',
      subtitle: 'ยังไม่ระบุราคา · 0 รายการ',
    });
  });
});

describe('Package recap CMS controls', () => {
  it('renames only the displayed manual highlight label', () => {
    expect(field(packageItemType, 'featured')).toMatchObject({
      name: 'featured',
      title: 'Highlight',
      type: 'boolean',
      initialValue: false,
      description: 'ไฮไลต์แพ็กเกจนี้',
    });
    const catalogItem = field(packagesSectionType, 'selectedPackages').of?.[0];
    expect(catalogItem).toBeDefined();
    expect(field(catalogItem!, 'featured')).toMatchObject({
      name: 'featured',
      title: 'ไฮไลต์การ์ดนี้',
      type: 'boolean',
      initialValue: false,
      description: 'เน้นการ์ดแพ็กเกจนี้เฉพาะใน section นี้',
    });
  });

  it('retains the shared style field, choices, defaults, and descriptions', () => {
    expect(field(ctaType, 'style')).toBe(ctaStyleField);
    expect(ctaStyleField).toMatchObject({
      name: 'style',
      title: 'Style',
      description: 'รูปแบบของปุ่ม CTA',
      initialValue: 'primary',
      options: {
        layout: 'radio',
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Secondary', value: 'secondary' },
          { title: 'Neutral', value: 'neutral' },
          { title: 'Link', value: 'link' },
        ],
      },
    });
    expect(field(packageType, 'cta')).toMatchObject({
      type: ctaType.name,
      description:
        'กำหนดข้อความ รูปแบบ และปลายทางของปุ่ม ใช้ร่วมกันใน section ที่เลือกแพ็กเกจนี้',
    });
    expect(field(packagesSectionType, 'background')).toMatchObject({
      description: 'พื้นหลังของส่วนแพ็กเกจ',
      initialValue: 'default',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
      },
    });
  });

  it('keeps required manual CTAs and the existing label and link validation', () => {
    const requiredRule = { required: vi.fn().mockReturnThis() };
    field(packageItemType, 'cta').validation?.(requiredRule);
    expect(requiredRule.required).toHaveBeenCalledOnce();

    const labelRule = { custom: vi.fn().mockReturnThis() };
    field(ctaType, 'label').validation?.(labelRule);
    const validateLabel = labelRule.custom.mock.calls[0][0];
    expect(validateLabel(undefined, {})).toBe('Label is required');
    expect(validateLabel([{ value: 'Contact us' }], {})).toBe(true);

    const ctaRule = { custom: vi.fn().mockReturnThis() };
    (ctaType.validation as (rule: unknown) => unknown)(ctaRule);
    const validateCta = ctaRule.custom.mock.calls[0][0];
    expect(validateCta({ linkType: 'internal' }, {})).toBe('Select a page');
    expect(validateCta({ linkType: 'external' }, {})).toBe('Provide a URL');
    expect(
      validateCta({ linkType: 'internal', pageRef: { _ref: 'contact' } }, {})
    ).toBe(true);
    expect(
      validateCta(
        { linkType: 'external', externalUrl: 'https://example.com' },
        {}
      )
    ).toBe(true);
    const uriRule = { uri: vi.fn().mockReturnThis() };
    field(ctaType, 'externalUrl').validation?.(uriRule);
    expect(uriRule.uri).toHaveBeenCalledWith({
      scheme: ['http', 'https', 'mailto', 'tel'],
    });
  });

  it('leaves top-level catalog CTA styles available', () => {
    expect(
      isStyleHidden(
        { ...pageDocument('commercialSections'), _type: 'package' },
        ['cta', 'style']
      )
    ).toBe(false);
  });

  it('leaves unresolved context visible', () => {
    const document = pageDocument('commercialSections');
    const path = recapStylePath('commercialSections');
    expect(isStyleHidden(undefined, path)).toBe(false);
    expect(isStyleHidden(document)).toBe(false);
    expect(isStyleHidden(document, [])).toBe(false);
    expect(
      isStyleHidden(document, [
        'commercialSections',
        { _key: 'missing' },
        ...path.slice(2),
      ])
    ).toBe(false);
    expect(
      isStyleHidden(document, ['commercialSections', 1, ...path.slice(2)])
    ).toBe(false);
    expect(isStyleHidden(document, ['unknownSections', ...path.slice(1)])).toBe(
      false
    );
  });
});

describe.each(['commercialSections', 'weddingSections'])(
  'Recap CTA style visibility in %s',
  (sections) => {
    it.each([undefined, 'manual', 'inline'])(
      'hides only manual item style for source %s without rewriting stored values',
      (sourceType) => {
        const document = pageDocument(sections, sourceType);
        const original = structuredClone(document);
        expect(isStyleHidden(document, recapStylePath(sections))).toBe(true);
        expect(document).toEqual(original);
      }
    );

    it('supports numeric package item paths while retaining the section key', () => {
      const path = recapStylePath(sections);
      path[3] = 0;
      expect(isStyleHidden(pageDocument(sections, 'manual'), path)).toBe(true);
    });

    it.each(['catalog', 'unknown'])(
      'does not hide styles for non-manual source %s',
      (sourceType) => {
        expect(
          isStyleHidden(
            pageDocument(sections, sourceType),
            recapStylePath(sections)
          )
        ).toBe(false);
      }
    );

    it.each([
      'heroSection',
      'ctaBannerSection',
      'contactSection',
      'packageComparisonSection',
    ])(
      'does not hide styles in %s even if the remaining path matches',
      (sectionType) => {
        expect(
          isStyleHidden(
            pageDocument(sections, 'manual', sectionType),
            recapStylePath(sections)
          )
        ).toBe(false);
      }
    );

    it('does not hide other CTA locations or the Contact submit style', () => {
      const document = pageDocument(sections, 'manual');
      for (const tail of [
        ['cta', 'style'],
        ['submitButton', 'style'],
        ['selectedPackages', { _key: 'card' }, 'cta', 'style'],
        ['heading', 'cta', 'style'],
        ['packages', { _key: 'card' }, 'submitButton', 'style'],
        ['packages', { _key: 'card' }, 'cta', 'label'],
        ['nested', 'packages', { _key: 'card' }, 'cta', 'style'],
      ] as Path[]) {
        expect(
          isStyleHidden(document, [sections, { _key: 'recap' }, ...tail])
        ).toBe(false);
      }
      expect(
        isStyleHidden(pageDocument(sections, undefined, 'contactSection'), [
          sections,
          { _key: 'recap' },
          'submitButton',
          'style',
        ])
      ).toBe(false);
    });
  }
);
