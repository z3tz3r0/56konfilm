import { describe, expect, it, vi } from 'vitest';
import { contactSectionType } from '@/sanity/schemaTypes/sections/contactSection';
import { contactChannelType } from '@/sanity/schemaTypes/objects/contactChannel';
import { pageType } from '@/sanity/schemaTypes/page';
import { schemaType } from '@/sanity/schemaTypes';
import { ctaStyleField, ctaType } from '@/sanity/schemaTypes/objects/cta';
import { localizedBlockType } from '@/sanity/schemaTypes/objects/localized';
import { socialMediaType } from '@/sanity/schemaTypes/objects/socialMedia';
import { CONTACT_SECTION } from '@/sanity/lib/queries/sections';
import { LOCALIZED } from '@/sanity/lib/queries/fragments';

interface SchemaField {
  name: string;
  type: string;
  fields?: SchemaField[];
  of?: Array<{ type: string }>;
  options?: { list?: Array<{ title: string; value: string }> };
  initialValue?: unknown;
  validation?: (rule: unknown) => unknown;
  components?: { input?: unknown };
}

const fields = contactSectionType.fields as unknown as SchemaField[];
const channelFields = contactChannelType.fields as unknown as SchemaField[];

function getField(definitions: SchemaField[] | undefined, name: string) {
  const field = definitions?.find((item) => item.name === name);
  if (!field) throw new Error(`Missing schema field: ${name}`);
  return field;
}

describe('Contact CMS schema', () => {
  it('registers the renamed section and channel types', () => {
    expect(contactSectionType.title).toBe('Contact Section');
    expect(contactSectionType.name).toBe('contactSection');
    expect(contactChannelType.name).toBe('contactChannel');
    expect(getField(fields, 'channels').of).toEqual([
      { type: 'contactChannel' },
    ]);
    expect(schemaType.types).toContain(contactSectionType);
    expect(schemaType.types).toContain(contactChannelType);
    const pageFields = pageType.fields as unknown as SchemaField[];
    for (const name of ['commercialSections', 'weddingSections']) {
      const sectionTypes = getField(pageFields, name).of?.map(
        ({ type }) => type
      );
      expect(sectionTypes).toContain('contactSection');
      expect(sectionTypes).not.toContain('contactInfoSection');
    }
  });

  it('projects only the renamed contact block type', () => {
    expect(CONTACT_SECTION).toContain('_type == "contactSection"');
    expect(CONTACT_SECTION).not.toContain('contactInfoSection');
  });

  it('reuses the localized heading and body instead of adding duplicate fields', () => {
    expect(getField(fields, 'heading').type).toBe(localizedBlockType.name);
    expect(localizedBlockType.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'heading',
          type: 'internationalizedArrayString',
        }),
        expect.objectContaining({
          name: 'body',
          type: 'internationalizedArrayText',
        }),
      ])
    );
  });

  it('supports multiline strings while retaining legacy channel fields', () => {
    expect(getField(channelFields, 'value').type).toBe('text');
    expect(getField(channelFields, 'icon').type).toBe('string');
    expect(getField(channelFields, 'iconPicker')).toMatchObject({
      type: 'icon',
    });
    expect(getField(channelFields, 'iconPicker').validation).toBeUndefined();
    expect(getField(channelFields, 'label').type).toBe(
      'internationalizedArrayString'
    );
    expect(getField(channelFields, 'linkUrl').type).toBe('url');
  });

  it('reuses socialMedia and keeps its icon optional for existing Footer data', () => {
    expect(getField(fields, 'socialHeading').type).toBe(
      'internationalizedArrayString'
    );
    expect(getField(fields, 'socialLinks').of).toEqual([
      { type: socialMediaType.name },
    ]);
    const socialFields = socialMediaType.fields as unknown as SchemaField[];
    expect(getField(socialFields, 'icon').type).toBe('icon');
    expect(getField(socialFields, 'icon').validation).toBeUndefined();
  });

  it('shares CTA styles without adding link settings to the submit button', () => {
    const buttonFields = getField(fields, 'submitButton').fields;
    expect(getField(buttonFields, 'style')).toBe(ctaStyleField);
    expect(ctaType.fields).toContain(ctaStyleField);
    expect(buttonFields?.map((field) => field.name)).toEqual([
      'label',
      'style',
      'size',
    ]);
    expect(getField(buttonFields, 'label').validation).toBeUndefined();
    expect(
      getField(buttonFields, 'size').options?.list?.map((item) => item.value)
    ).toEqual(['default', 'sm', 'md', 'lg']);
  });

  it('keeps the new section settings optional on existing documents', () => {
    for (const name of ['socialHeading', 'submitButton', 'map']) {
      expect(getField(fields, name).validation).toBeUndefined();
    }
  });

  it('clarifies the social link name without renaming the stored label', () => {
    const socialFields = socialMediaType.fields as unknown as Array<
      SchemaField & { title?: string; description?: string }
    >;
    expect(getField(socialFields, 'label')).toMatchObject({
      name: 'label',
      title: 'Social link name',
      type: 'internationalizedArrayString',
      description:
        'ใส่ชื่อช่องทาง เช่น Facebook หรือ Instagram หากไม่ได้เลือกไอคอน เว็บไซต์จะแสดงชื่อนี้แทน และใช้เป็นชื่อลิงก์ในส่วนท้ายเว็บไซต์ด้วย',
    });
    const rule = { required: vi.fn().mockReturnThis() };
    getField(socialFields, 'label').validation?.(rule);
    expect(rule.required).toHaveBeenCalledOnce();
  });

  function socialNameValidation() {
    const rule = {
      custom: vi.fn().mockReturnThis(),
      error: vi.fn().mockReturnThis(),
    };
    getField(fields, 'socialLinks').validation?.(rule);
    expect(rule.error).toHaveBeenCalledOnce();
    return rule.custom.mock.calls[0][0] as (value: unknown) =>
      | true
      | {
          message: string;
          paths: Array<Array<string | number | { _key: string }>>;
        };
  }

  it.each([undefined, []])(
    'allows omitted or empty Social Links (%j)',
    (value) => {
      expect(socialNameValidation()(value)).toBe(true);
    }
  );

  it.each([
    undefined,
    [],
    [{ _key: 'en' }],
    [{ _key: 'en', value: '' }],
    [{ _key: 'en', value: ' \n\t ' }],
  ])(
    'rejects missing or blank social names (%j) with a publish-blocking error',
    (label) => {
      const result = socialNameValidation()([{ _key: 'facebook', label }]);
      expect(result).toMatchObject({
        message: expect.stringContaining('social link name'),
        paths: expect.arrayContaining([
          expect.arrayContaining([{ _key: 'facebook' }, 'label']),
        ]),
      });
    }
  );

  it('points to each blank added translation without requiring every supported language', () => {
    const validate = socialNameValidation();
    expect(validate([{ label: [{ _key: 'en', value: 'Facebook' }] }])).toBe(
      true
    );
    expect(
      validate([{ label: [{ _key: 'th', value: 'เฟซบุ๊กของบริษัท' }] }])
    ).toBe(true);
    expect(
      validate([
        {
          _key: 'facebook',
          label: [
            { _key: 'english-id', language: 'en', value: 'Facebook' },
            { _key: 'thai-id', language: 'th', value: ' ' },
          ],
        },
      ])
    ).toMatchObject({
      paths: [[{ _key: 'facebook' }, 'label', { _key: 'thai-id' }, 'value']],
    });
    expect(validate([{ label: [{ value: ' ' }] }])).toMatchObject({
      paths: [[0, 'label', 0, 'value']],
    });
  });

  it('validates optional map URLs using the same allowlist as the frontend', () => {
    const mapFields = getField(fields, 'map').fields;
    expect(getField(mapFields, 'title').type).toBe(
      'internationalizedArrayString'
    );
    expect(getField(mapFields, 'embedUrl').type).toBe('url');
    expect(getField(mapFields, 'embedUrl').components?.input).toBeDefined();
    const rule = {
      uri: vi.fn().mockReturnThis(),
      custom: vi.fn().mockReturnThis(),
    };
    getField(mapFields, 'embedUrl').validation?.(rule);
    expect(rule.uri).toHaveBeenCalledWith({ scheme: ['https'] });
    const validate = rule.custom.mock.calls[0][0] as (
      value?: string
    ) => boolean | string;
    expect(validate(undefined)).toBe(true);
    expect(validate('')).toBe(true);
    expect(validate('https://www.google.com/maps/embed?pb=!1m18')).toBe(true);
    expect(validate('https://maps.app.goo.gl/example')).toEqual(
      expect.any(String)
    );
    expect(validate('<iframe src="example"></iframe>')).toEqual(
      expect.any(String)
    );
  });

  it('projects new CMS settings alongside the existing contact fields', () => {
    for (const field of [
      'value,',
      'icon,',
      'linkUrl',
      'iconPicker { name }',
      'socialLinks[]',
      'submitButton {',
      'map {',
      'embedUrl,',
    ]) {
      expect(CONTACT_SECTION).toContain(field);
    }
    for (const field of [
      'heading',
      'body',
      'label',
      'socialHeading',
      'title',
    ]) {
      expect(CONTACT_SECTION).toContain(LOCALIZED(field));
    }
  });
});
