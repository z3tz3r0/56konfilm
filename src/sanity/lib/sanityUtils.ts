import { SiteMode } from '@shared/config';
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

  if (!id) {
    return true;
  }

  const client = getClient({ apiVersion: '2023-01-01' });
  const cleanId = id.replace(/^drafts\./, '');
  const mode = document?.siteMode || 'production';
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
    // 1. เลือกเช็กเฉพาะประเภทที่ตรงกับโหมดปัจจุบัน
      (siteMode == $mode && _type == "page") && 
    
    // 2. เช็ก Slug ที่ซ้ำกัน
    slug.current == $slug &&
    
    // 3. ยกเว้นตัวมันเอง (ทั้งฉบับร่างและตัวจริง)
    !(_id in [$draft, $published])
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
        description:
          'ชื่อหน้า (จะแสดงผลภายในระบบ และใช้เป็นชื่อหน้าหลักสำหรับ SEO หากไม่ได้ระบุ SEO Title แยกต่างหาก)',
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
          'URL ที่จะใช้เข้าถึงหน้านี้ (เช่น "about", "services") ไม่ต้องใส่เครื่องหมาย / ด้านหน้า พยายามให้สั้นและมีคีย์เวิร์ดที่เกี่ยวข้องเพื่อผลดีต่อ SEO',
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
        description: `ส่วนสำหรับจัดการเนื้อหาของหน้านี้ (สามารถเพิ่ม/ลบ หรือจัดลำดับ section ต่างๆ ได้อย่างอิสระ)`,
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
          'หัวข้อที่แสดงบน Google (แนะนำ 50-60 ตัวอักษร, ควรใส่คีย์เวิร์ดหลักไว้ช่วงต้นเพื่อประสิทธิภาพสูงสุด)',
        group: 'seo',
      }),
      defineField({
        name: 'seo',
        title: 'Seo',
        description:
          'การตั้งค่า Meta Tags เพิ่มเติมสำหรับการแชร์ลงโซเชียลมีเดียและการแสดงผลบน Google (หากไม่ใส่ ระบบจะดึงข้อมูลจาก Page Name ให้อัตโนมัติ)',
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
