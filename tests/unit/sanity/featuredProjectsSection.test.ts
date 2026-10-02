import { describe, expect, it, vi } from 'vitest';
import { featuredProjectsSectionType } from '@/sanity/schemaTypes/sections/featuredProjectsSection';
import { localizedBlockType } from '@/sanity/schemaTypes/objects/localized';

interface SchemaField {
  name: string;
  type: string;
  description?: string;
  hidden?: (context: {
    document?: { siteMode?: string };
    parent?: { sourceType?: string };
  }) => boolean;
  validation?: (rule: unknown) => unknown;
}

const fields = featuredProjectsSectionType.fields as unknown as SchemaField[];

function getField(name: string) {
  const field = fields.find((item) => item.name === name);
  if (!field) throw new Error(`Missing schema field: ${name}`);
  return field;
}

function getValidator(name: string) {
  const rule = {
    required: vi.fn().mockReturnThis(),
    custom: vi.fn().mockReturnThis(),
  };
  getField(name).validation?.(rule);
  const validate = rule.custom.mock.calls[0][0] as (
    value: unknown,
    context: {
      document?: { siteMode?: string };
      parent?: { sourceType?: string };
    }
  ) => true | string;
  return { rule, validate };
}

describe('Featured Projects CMS schema', () => {
  it('keeps the main heading required without requiring eyebrow or body', () => {
    expect(getField('heading').type).toBe(localizedBlockType.name);
    const { rule, validate } = getValidator('heading');
    expect(rule.required).toHaveBeenCalledOnce();
    expect(validate({ heading: [{ value: 'Love Stories' }] }, {})).toBe(true);
    expect(validate({ heading: [] }, {})).toEqual(expect.any(String));
    expect(validate({ heading: [{ value: '  ' }] }, {})).toEqual(
      expect.any(String)
    );
    expect(
      validate({ heading: [{ value: 'Love Stories' }, { value: '' }] }, {})
    ).toEqual(expect.any(String));
  });

  it('removes the collage-specific project field', () => {
    expect(fields.map((field) => field.name)).not.toContain(
      'weddingSelectedProjects'
    );
  });

  it.each(['production', 'wedding'])(
    'shows the shared selection only for curated %s content',
    (mode) => {
      const selection = getField('selectedProjects');
      expect(selection.description).toContain('6 รายการ');
      expect(
        selection.hidden?.({
          document: { siteMode: mode },
          parent: { sourceType: 'curated' },
        })
      ).toBe(false);
      expect(
        selection.hidden?.({
          document: { siteMode: mode },
          parent: { sourceType: 'latest' },
        })
      ).toBe(true);
    }
  );

  it.each(['production', 'wedding'])(
    'validates one to six unique projects for %s',
    (mode) => {
      const { validate } = getValidator('selectedProjects');
      const context = {
        document: { siteMode: mode },
        parent: { sourceType: 'curated' },
      };
      const references = Array.from({ length: 6 }, (_, index) => ({
        _ref: `project-${index}`,
      }));
      expect(validate(references, context)).toBe(true);
      expect(validate([references[0]], context)).toBe(true);
      expect(validate(undefined, context)).toEqual(expect.any(String));
      expect(validate([], context)).toEqual(expect.any(String));
      expect(validate([...references, { _ref: 'extra' }], context)).toEqual(
        expect.any(String)
      );
      expect(validate([references[0], references[0]], context)).toEqual(
        expect.any(String)
      );
      expect(
        validate([], { ...context, parent: { sourceType: 'latest' } })
      ).toBe(true);
    }
  );

  it('keeps the concise content-source preview', () => {
    expect(
      featuredProjectsSectionType.preview?.prepare?.({
        title: 'Stories',
        sourceType: 'latest',
      })
    ).toEqual({ title: 'Stories section', subtitle: 'Auto (Latest)' });
  });
});
