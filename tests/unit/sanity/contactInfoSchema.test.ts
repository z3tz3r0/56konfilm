import { describe, expect, it, vi } from 'vitest';
import { contactInfoSectionType } from '@/sanity/schemaTypes/sections/contactInfoSection';
import { contactInfoItemType } from '@/sanity/schemaTypes/objects/contactInfoItem';
import { ctaStyleField, ctaType } from '@/sanity/schemaTypes/objects/cta';
import { localizedBlockType } from '@/sanity/schemaTypes/objects/localized';
import { socialMediaType } from '@/sanity/schemaTypes/objects/socialMedia';
import { CONTACT_INFO_SECTION } from '@/sanity/lib/queries/sections';
import { LOCALIZED } from '@/sanity/lib/queries/fragments';

interface SchemaField {
  name: string;
  type: string;
  fields?: SchemaField[];
  of?: Array<{ type: string }>;
  options?: { list?: Array<{ title: string; value: string }> };
  initialValue?: unknown;
  validation?: (rule: unknown) => unknown;
}

const fields = contactInfoSectionType.fields as unknown as SchemaField[];
const channelFields = contactInfoItemType.fields as unknown as SchemaField[];

function getField(definitions: SchemaField[] | undefined, name: string) {
  const field = definitions?.find((item) => item.name === name);
  if (!field) throw new Error(`Missing schema field: ${name}`);
  return field;
}

describe('Contact Info CMS schema', () => {
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

  it('does not require the newly added section fields on existing documents', () => {
    for (const name of [
      'socialHeading',
      'socialLinks',
      'submitButton',
      'map',
    ]) {
      expect(getField(fields, name).validation).toBeUndefined();
    }
  });

  it('validates optional map URLs using the same allowlist as the frontend', () => {
    const mapFields = getField(fields, 'map').fields;
    expect(getField(mapFields, 'title').type).toBe(
      'internationalizedArrayString'
    );
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
      expect(CONTACT_INFO_SECTION).toContain(field);
    }
    for (const field of [
      'heading',
      'body',
      'label',
      'socialHeading',
      'title',
    ]) {
      expect(CONTACT_INFO_SECTION).toContain(LOCALIZED(field));
    }
  });
});
