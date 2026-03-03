import { SiteMode } from '@/lib/preferences';
import { localizedStringField } from '@/sanity/schemaTypes/objects/localized';
import { defineField, defineType, SlugValidationContext } from 'sanity';

async function validateSlugUniquenessByMode(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  const document = context?.document;
  const getClient = context?.getClient;

  if (!document || !getClient) {
    return true;
  }

  // During early draft initialization, Studio can call isUnique before revision is ready.
  const id = document?._id;
  const rev = document?._rev;

  if (!id || !rev) {
    return true;
  }

  const client = getClient({ apiVersion: '2023-01-01' });
  const cleanId = id.replace(/^drafts\./, '');
  const mode = (document as any)?.siteMode || 'production';
  const slugCandidate = slug as string | { current?: string } | undefined;
  const slugValue =
    typeof slugCandidate === 'string'
      ? slugCandidate
      : typeof slugCandidate?.current === 'string'
        ? slugCandidate.current
        : '';

  if (!slugValue) {
    return true;
  }

  const params = {
    draft: `drafts.${cleanId}`,
    published: cleanId,
    slug: slugValue,
    mode,
  };

  const query = `
    count(*[
      _type in ["productionPages", "weddingPages"] && 
      slug.current == $slug &&
      !(_id in [$draft, $published]) &&
      (
        // 1. ถ้าหน้าปัจจุบันเป็น 'both' ต้องไม่ซ้ำกับใครเลยในชื่อนี้
        $mode == "both" || 
        
        // 2. ถ้าหน้าปัจจุบันเป็น 'production' หรือ 'wedding'
        // ให้เช็กเฉพาะหน้าที่อยู่ในโหมดเดียวกัน หรือหน้าที่เป็น 'both'
        (
          coalesce(siteMode, "production") == $mode || 
          coalesce(siteMode, "production") == "both"
        )
      )
    ])
  `;

  try {
    const result = await client.fetch(query, params);
    return result === 0;
  } catch (error) {
    console.warn('Slug uniqueness check failed', error);
    return true;
  }
}

interface PageSchemaConfig {
  name: 'productionPages' | 'weddingPages';
  title: string;
  siteMode: SiteMode;
  contentBlocksName: 'commercialSections' | 'weddingSections';
  contentBlocksTitle: string;
  allowedSections: string[]; // รายการ section ที่อนุญาตในโหมดนั้นๆ
}

function createPageSchema(config: PageSchemaConfig) {
  return defineType({
    name: config.name,
    title: config.title,
    description: 'ชื่อหน้า',
    type: 'document',
    groups: [
      { name: 'settings', title: 'Settings', default: true },
      { name: 'sections', title: 'Sections Management' },
      { name: 'seo', title: 'SEO' },
    ],
    fields: [
      // --- Settings ---
      localizedStringField({
        name: 'page',
        title: 'Page Name',
        description: 'ชื่อหน้า',
        group: 'settings',
      }),
      defineField({
        name: 'siteMode',
        type: 'string',
        hidden: true, // ซ่อนไว้เพราะเราล็อคค่าตามไฟล์ที่เรียกใช้แล้ว
        initialValue: config.siteMode,
        group: 'settings',
      }),
      defineField({
        name: 'slug',
        title: 'Slug',
        description:
          'URL ของหน้านี้ เช่น about, services, contact (ไม่ต้องใส่ / ด้านหน้า). สามารถใช้ slug เดียวกันข้ามโหมดได้ หากไม่ได้ตั้งเป็น Both',
        type: 'slug',
        options: {
          source: 'page',
          isUnique: validateSlugUniquenessByMode,
        },
        group: 'settings',
        validation: (Rule) => Rule.required(),
      }),

      // --- Sections Management (Dynamic Part) ---
      defineField({
        name: config.contentBlocksName,
        title: config.contentBlocksTitle,
        description: `คลิกที่ section ต่างๆ เพื่อปรับแต่ง`,
        group: 'sections',
        type: 'array',
        of: config.allowedSections.map((type) => ({ type })),
        validation: (Rule) =>
          Rule.required()
            .min(1)
            .error(`${config.contentBlocksTitle} are required.`),
      }),

      // --- SEO ---
      localizedStringField({
        name: 'seoTitle',
        title: 'SEO Title',
        description:
          'หัวข้อที่แสดงบน Google (แนะนำ 50-60 ตัวอักษร, ใส่คีย์เวิร์ดหลักช่วงต้นประโยค)',
        group: 'seo',
      }),
      defineField({
        name: 'seo',
        title: 'Seo',
        description:
          'ตั้งค่า SEO เพิ่มเติมของหน้านี้ (Title, Description, Open Graph Image)',
        type: 'seo',
        group: 'seo',
      }),
    ],
    preview: {
      select: {
        title: 'page.0.value',
        slug: 'slug.current',
      },
      prepare({ title, slug }) {
        return {
          title: title || 'Untitled Page',
          subtitle: slug || 'No slug',
        };
      },
    },
  });
}

export { validateSlugUniquenessByMode, createPageSchema };
