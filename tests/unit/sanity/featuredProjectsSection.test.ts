import { describe, expect, it, vi } from 'vitest';
import { featuredProjectsSectionType } from '@/sanity/schemaTypes/sections/featuredProjectsSection';
import { FEATURED_PROJECT_LIMITS } from '@shared/config/preferences';
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

  it('shows each curated selection field only in its own mode', () => {
    const production = getField('selectedProjects');
    const wedding = getField('weddingSelectedProjects');
    expect(production.description).toContain('6 รายการ');
    expect(wedding.description).toContain('3 รายการ');
    expect(
      production.hidden?.({
        document: { siteMode: 'production' },
        parent: { sourceType: 'curated' },
      })
    ).toBe(false);
    expect(
      wedding.hidden?.({
        document: { siteMode: 'wedding' },
        parent: { sourceType: 'curated' },
      })
    ).toBe(false);
    expect(
      production.hidden?.({
        document: { siteMode: 'wedding' },
        parent: { sourceType: 'curated' },
      })
    ).toBe(true);
    expect(
      wedding.hidden?.({
        document: { siteMode: 'production' },
        parent: { sourceType: 'curated' },
      })
    ).toBe(true);
    expect(
      wedding.hidden?.({
        document: { siteMode: 'wedding' },
        parent: { sourceType: 'latest' },
      })
    ).toBe(true);
  });

  it.each([
    ['selectedProjects', 'production', FEATURED_PROJECT_LIMITS.production],
    ['weddingSelectedProjects', 'wedding', FEATURED_PROJECT_LIMITS.wedding],
  ] as const)('validates %s selections independently', (field, mode, limit) => {
    const { validate } = getValidator(field);
    const context = {
      document: { siteMode: mode },
      parent: { sourceType: 'curated' },
    };
    const references = Array.from({ length: limit }, (_, index) => ({
      _ref: `project-${index}`,
    }));
    expect(validate(references, context)).toBe(true);
    expect(validate([], context)).toEqual(expect.any(String));
    expect(validate([...references, { _ref: 'extra' }], context)).toEqual(
      expect.any(String)
    );
    expect(validate([references[0], references[0]], context)).toEqual(
      expect.any(String)
    );
    expect(
      validate([], {
        document: { siteMode: mode },
        parent: { sourceType: 'latest' },
      })
    ).toBe(true);
    expect(
      validate([], {
        document: {
          siteMode: mode === 'production' ? 'wedding' : 'production',
        },
        parent: { sourceType: 'curated' },
      })
    ).toBe(true);
  });

  it('does not promise six latest projects in the Studio preview', () => {
    expect(
      featuredProjectsSectionType.preview?.prepare?.({
        title: 'Stories',
        sourceType: 'latest',
      })
    ).toEqual({ title: 'Stories section', subtitle: 'Auto (Latest)' });
  });
});
