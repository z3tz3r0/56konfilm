import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import {
  createSchema,
  validateDocument,
  type Path,
  type SanityDocument,
  type Workspace,
} from 'sanity';
import { timelineSectionType } from '@/sanity/schemaTypes/sections/timelineSection';
import { timelineStepType } from '@/sanity/schemaTypes/objects/timelineStep';
import { processSectionType } from '@/sanity/schemaTypes/sections/processSection';
import { processItemType } from '@/sanity/schemaTypes/objects/processItem';

// Load the installed CommonJS entry without changing Vite's root configuration
// for the plugin's styled-components Studio UI interop.
const { iconify } = createRequire(import.meta.url)(
  'sanity-plugin-iconify'
) as Pick<typeof import('sanity-plugin-iconify'), 'iconify'>;

interface Context {
  document?: SanityDocument;
  path?: Path;
  hidden?: boolean;
}
type Validator = (value: unknown, context: Context) => true | string;
interface Field {
  name: string;
  type: string;
  title?: string;
  description?: string;
  initialValue?: unknown;
  hidden?: boolean | ((context: Context) => boolean);
  components?: unknown;
  options?: unknown;
  validation?: (rule: unknown) => unknown;
}

/** Find a schema field by name, failing explicitly if the fixture schema lacks it. */
function field(schema: { fields?: unknown }, name: string): Field {
  const result = (schema.fields as Field[]).find((item) => item.name === name);
  if (!result) throw new Error(`Missing field: ${name}`);
  return result;
}
const picker = field(timelineStepType, 'iconPicker');

/** Exercise the real callbacks without importing application env or Studio config. */
function validate(value: unknown, context: Context) {
  let validator: Validator | undefined;
  const rule = {
    /** Capture the custom validator while preserving the chainable Rule interface. */
    custom(callback: Validator) {
      validator = callback;
      return rule;
    },
  };
  expect(picker.validation!(rule)).toBe(rule);
  if (!validator) throw new Error('Missing icon validator');
  return validator(value, context);
}
/** Evaluate the actual picker visibility callback with the supplied document path. */
function hidden(context: Context) {
  if (typeof picker.hidden !== 'function')
    throw new Error('Missing hidden rule');
  return picker.hidden(context);
}
const selectedIcon = { _type: 'icon', name: 'mdi:camera' };
const legacyImage = {
  _type: 'image',
  asset: { _type: 'reference', _ref: `image-${'a'.repeat(40)}-48x48-png` },
};

/** Build an owning section, an oppositely toggled sibling, and keyed step contexts. */
function fixture(mode: 'production' | 'wedding', hasIcon?: boolean) {
  const sectionField =
    mode === 'production' ? 'commercialSections' : 'weddingSections';
  const section = {
    _key: 'timeline',
    _type: 'timelineSection',
    ...(hasIcon === undefined ? {} : { hasIcon }),
    steps: [1, 2, 3].map((order) => ({
      _key: `step-${order}`,
      _type: 'timelineStep',
      order,
      icon: structuredClone(legacyImage),
      iconPicker: { ...selectedIcon },
    })),
  };
  const document: SanityDocument = {
    _id: 'fixture-page',
    _type: 'page',
    _rev: 'fixture-revision',
    _createdAt: '2026-01-01T00:00:00Z',
    _updatedAt: '2026-01-01T00:00:00Z',
    siteMode: mode,
    [sectionField]: [
      { _key: 'other-timeline', _type: 'timelineSection', hasIcon: !hasIcon },
      section,
    ],
  };
  /** Point validation at a selected step within the owning section. */
  const context = (stepKey = 'step-1'): Context => ({
    document,
    path: [
      sectionField,
      { _key: 'timeline' },
      'steps',
      { _key: stepKey },
      'iconPicker',
    ],
  });
  return { document, section, context };
}

describe('Timeline section icon schema', () => {
  it('defaults a single section-wide toggle to off without step-level toggles', () => {
    expect(field(timelineSectionType, 'hasIcon')).toMatchObject({
      type: 'boolean',
      title: 'Show Icons on Cards?',
      initialValue: false,
    });
    expect(
      timelineStepType.fields.some((item) => item.name === 'hasIcon')
    ).toBe(false);
  });
  it('uses the installed icon schema without creating a custom input', () => {
    expect(picker.type).toBe('icon');
    expect(picker.components).toBeUndefined();
  });
  it('keeps the original image field, description, and hotspot option but hides it', () => {
    expect(field(timelineStepType, 'icon')).toMatchObject({
      type: 'image',
      title: 'Icon',
      description: 'ไอคอน PNG ของขั้นตอน',
      options: { hotspot: true },
      hidden: true,
    });
    expect(field(timelineStepType, 'icon').validation).toBeUndefined();
  });
  it('preserves required order and at least two required timeline steps', () => {
    const rule = {
      required: vi.fn().mockReturnThis(),
      min: vi.fn().mockReturnThis(),
    };
    field(timelineStepType, 'order').validation!(rule);
    expect(rule.required).toHaveBeenCalledOnce();
    expect(rule.min).toHaveBeenCalledWith(1);
    field(timelineSectionType, 'steps').validation!(rule);
    expect(rule.required).toHaveBeenCalledTimes(2);
    expect(rule.min).toHaveBeenCalledWith(2);
  });
  it('restores the original Process schema and its visible string icon', () => {
    expect(processSectionType.fields.map((item) => item.name)).toEqual([
      'heading',
      'steps',
      'layout',
      'background',
    ]);
    expect(processItemType.fields.map((item) => item.name)).toEqual([
      'stepNumber',
      'title',
      'description',
      'icon',
    ]);
    expect(field(processItemType, 'icon').type).toBe('string');
    expect(field(processItemType, 'icon').hidden).toBeUndefined();
  });

  for (const mode of ['production', 'wedding'] as const) {
    describe(mode, () => {
      it('shows the picker for every step and accepts a complete selection', () => {
        const { section, context } = fixture(mode, true);
        for (const step of section.steps) {
          expect(hidden(context(step._key))).toBe(false);
          expect(validate(step.iconPicker, context(step._key))).toBe(true);
        }
      });
      it('rejects a missing icon at its own step while siblings are selected', () => {
        const { section, context } = fixture(mode, true);
        expect(
          section.steps.map((step, index) =>
            validate(
              index === 1 ? undefined : step.iconPicker,
              context(step._key)
            )
          )
        ).toEqual([true, 'Please choose an icon for this step', true]);
      });
      it('rejects missing or malformed picker names and does not accept legacy images', () => {
        const { context } = fixture(mode, true);
        for (const value of [
          undefined,
          null,
          {},
          { _type: 'icon' },
          { name: '' },
          { name: ' \n\t ' },
          { name: 123 },
          legacyImage,
        ]) {
          expect(validate(value, context())).toBe(
            'Please choose an icon for this step'
          );
        }
      });
      it('requires an icon from the owner toggle even if context.hidden disagrees', () => {
        const { context } = fixture(mode, true);
        expect(validate(undefined, { ...context(), hidden: true })).toBe(
          'Please choose an icon for this step'
        );
      });
      it.each([false, undefined])(
        'hides and does not require icons when hasIcon is %s',
        (hasIcon) => {
          const { section, context } = fixture(mode, hasIcon);
          for (const step of section.steps) {
            expect(hidden(context(step._key))).toBe(true);
            expect(validate(undefined, context(step._key))).toBe(true);
            expect(validate({}, context(step._key))).toBe(true);
          }
        }
      );
      it('retains picker selections and legacy images when toggled off and on', () => {
        const { document, section, context } = fixture(mode, true);
        const before = structuredClone(document);
        section.hasIcon = false;
        expect(hidden(context())).toBe(true);
        expect(validate(selectedIcon, context())).toBe(true);
        section.hasIcon = true;
        expect(hidden(context())).toBe(false);
        expect(validate(selectedIcon, context())).toBe(true);
        expect(document).toEqual(before);
      });
    });
  }
  it('hides and skips conditional validation when the owner cannot be resolved', () => {
    const { document, context } = fixture('production', true);
    for (const ctx of [
      {},
      { document },
      { path: context().path },
      {
        document,
        path: [
          'commercialSections',
          { _key: 'missing' },
          'steps',
          { _key: 'step-1' },
          'iconPicker',
        ],
      },
    ]) {
      expect(hidden(ctx)).toBe(true);
      expect(validate(undefined, ctx)).toBe(true);
    }
  });
  it('does not apply Timeline validation to a Process section', () => {
    const { section, context } = fixture('wedding', true);
    section._type = 'processSection';
    expect(hidden(context())).toBe(true);
    expect(validate(undefined, context())).toBe(true);
  });
});

describe('Native Sanity Timeline icon validation', () => {
  // Use the installed plugin and actual field definitions; omit unrelated
  // localized fields so only the icon's blocking error markers are measured.
  const pluginTypes = iconify({ showName: true }).schema?.types;
  if (!Array.isArray(pluginTypes)) throw new Error('Missing Iconify schema');
  const schema = createSchema({
    name: 'timeline-icons-fixture',
    types: [
      ...pluginTypes,
      {
        name: 'timelineStep',
        type: 'object',
        fields: timelineStepType.fields.filter((item) =>
          ['iconPicker', 'icon'].includes(item.name)
        ),
      },
      {
        name: 'timelineSection',
        type: 'object',
        fields: [
          timelineSectionType.fields.find((item) => item.name === 'hasIcon')!,
          { name: 'steps', type: 'array', of: [{ type: 'timelineStep' }] },
        ],
      },
      {
        name: 'page',
        type: 'document',
        fields: ['commercialSections', 'weddingSections'].map((name) => ({
          name,
          type: 'array',
          of: [{ type: 'timelineSection' }],
        })),
      },
    ],
  });
  /** Return native Sanity blocking errors while asserting validation stays offline. */
  async function markers(document: SanityDocument) {
    const getClient = vi.fn(() => {
      throw new Error('Icon validation must not request a client');
    });
    const workspace = {
      schema,
      getClient,
      i18n: { loadNamespaces: async () => {}, t: (key: string) => key },
    } as unknown as Workspace;
    const result = await validateDocument({
      document,
      workspace,
      getDocumentExists: async () => true,
    });
    expect(getClient).not.toHaveBeenCalled();
    return result.filter((marker) => marker.level === 'error');
  }
  for (const mode of ['production', 'wedding'] as const) {
    it(`returns a blocking error at the missing ${mode} step despite its legacy image`, async () => {
      const { document, section, context } = fixture(mode, true);
      Reflect.deleteProperty(section.steps[1], 'iconPicker');
      const result = await markers(document);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        level: 'error',
        path: context('step-2').path,
      });
      expect(result[0].item?.message).toBe(
        'Please choose an icon for this step'
      );
    });
    it(`accepts all selected ${mode} icons through the real plugin schema`, async () => {
      expect(await markers(fixture(mode, true).document)).toEqual([]);
    });
    it.each([false, undefined])(
      `allows missing ${mode} icons when hasIcon is %s`,
      async (hasIcon) => {
        const { document, section } = fixture(mode, hasIcon);
        for (const step of section.steps)
          Reflect.deleteProperty(step, 'iconPicker');
        expect(await markers(document)).toEqual([]);
      }
    );
    it(`blocks a blank ${mode} picker name`, async () => {
      const { document, section } = fixture(mode, true);
      section.steps[0].iconPicker.name = '   ';
      const result = await markers(document);
      expect(result).toHaveLength(1);
      expect(result[0].item?.message).toBe(
        'Please choose an icon for this step'
      );
    });
  }
});
