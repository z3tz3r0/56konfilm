import { describe, expect, it, vi } from 'vitest';
import { logoShowcaseSectionType } from '@/sanity/schemaTypes/sections/logoShowcaseSection';
import { localizedBlockType } from '@/sanity/schemaTypes/objects/localized';
import { logoItemType } from '@/sanity/schemaTypes/objects/logoItem';
import { pageType } from '@/sanity/schemaTypes/page';

interface Field {
  name: string;
  type: string;
  hidden?: boolean;
  initialValue?: unknown;
  of?: Array<{ type: string }>;
  validation?: (rule: unknown) => unknown;
  options?: unknown;
}

/** Return a named schema field, throwing if the expected field is missing. */
function field(schema: { fields?: unknown }, name: string) {
  const result = (schema.fields as Field[]).find((item) => item.name === name);
  if (!result) throw new Error(`Missing schema field: ${name}`);
  return result;
}

/** Prepare the Logo Showcase Studio preview from the selected field values. */
function preview(selection: Record<string, unknown>) {
  return logoShowcaseSectionType.preview!.prepare!(selection);
}

describe('Logo Showcase schema', () => {
  it('uses the new persisted identity and registers it in both page builders', () => {
    expect(logoShowcaseSectionType.name).toBe('logoShowcaseSection');
    expect(logoShowcaseSectionType.title).toBe('Logo Showcase Section');
    for (const name of ['commercialSections', 'weddingSections']) {
      expect(field(pageType, name).of).toContainEqual({
        type: logoShowcaseSectionType.name,
      });
    }
  });

  it('reuses the complete localized heading with centered initial alignment', () => {
    expect(field(logoShowcaseSectionType, 'heading')).toMatchObject({
      type: localizedBlockType.name,
      initialValue: { align: 'center' },
    });
    expect(localizedBlockType.fields.map((item) => item.name)).toEqual([
      'eyebrow',
      'heading',
      'body',
      'align',
    ]);
    const required = vi.fn();
    field(localizedBlockType, 'heading').validation!({ required });
    expect(required).toHaveBeenCalledOnce();
    expect(field(localizedBlockType, 'eyebrow').validation).toBeUndefined();
    expect(field(localizedBlockType, 'body').validation).toBeUndefined();
  });

  it('keeps the hidden localized title without making legacy headings mandatory', () => {
    expect(field(logoShowcaseSectionType, 'title')).toMatchObject({
      type: 'internationalizedArrayString',
      hidden: true,
    });
    expect(
      field(logoShowcaseSectionType, 'heading').validation
    ).toBeUndefined();
  });

  it('requires three through twenty logo items using the existing image/alt schema', () => {
    const rule = {
      required: vi.fn().mockReturnThis(),
      min: vi.fn().mockReturnThis(),
      max: vi.fn().mockReturnThis(),
    };
    const logos = field(logoShowcaseSectionType, 'logos');
    expect(logos.validation!(rule)).toBe(rule);
    expect(rule.required).toHaveBeenCalledOnce();
    expect(rule.min).toHaveBeenCalledExactlyOnceWith(3);
    expect(rule.max).toHaveBeenCalledExactlyOnceWith(20);
    expect(logos.of).toEqual([{ type: logoItemType.name }]);
    for (const name of ['image', 'alt']) {
      rule.required.mockClear();
      field(logoItemType, name).validation!(rule);
      expect(rule.required).toHaveBeenCalledOnce();
    }
  });

  it('preserves the existing section background choices and default', () => {
    expect(field(logoShowcaseSectionType, 'background')).toMatchObject({
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

  it('prefers the new heading and summarizes the actual collection', () => {
    expect(
      preview({
        heading: '  Trusted brands  ',
        title: 'Old title',
        logos: Array.from({ length: 13 }, () => ({})),
        background: 'contrast',
      })
    ).toEqual({
      title: 'Trusted brands section',
      subtitle: 'contrast · 13 logos',
    });
  });

  it('falls back to the legacy title and handles empty draft content', () => {
    expect(
      preview({ heading: ' ', title: 'ลูกค้าของเรา', logos: [{}] })
    ).toEqual({
      title: 'ลูกค้าของเรา section',
      subtitle: '1 logo',
    });
    expect(preview({ background: 'default' })).toEqual({
      title: 'Logo Showcase Section',
      subtitle: '0 logos',
    });
  });
});
