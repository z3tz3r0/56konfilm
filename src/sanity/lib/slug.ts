import { SlugValidationContext } from 'sanity';

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

/**
 * ฟังก์ชันแปลงข้อความเป็น URL Slug โดยการเปลี่ยนจุด (.) และช่องว่างให้เป็นขีดกลาง (-)
 * พร้อมทั้งลบอักขระพิเศษออก เพื่อความปลอดภัยของระบบ Routing ใน Next.js
 */
function sanitizeUrlSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\./g, '-') // เปลี่ยนจุด (.) ทุกตัวให้กลายเป็นขีดกลาง (-)
    .replace(/\s+/g, '-') // เปลี่ยนช่องว่าง (Space) ให้กลายเป็นขีดกลาง (-)
    .replace(/[^a-z0-9-]/g, '') // ลบอักขระพิเศษอื่นๆ ที่ไม่ใช่ตัวเลข ตัวอักษร และขีดกลาง
    .replace(/-+/g, '-') // ยุบเครื่องหมายขีดกลางที่ติดกันหลายตัวให้เหลือตัวเดียว (เช่น --- เป็น -)
    .replace(/^-+|-+$/g, '') // ตัดเครื่องหมายขีดกลางที่อยู่หน้าสุดและหลังสุดออก
    .slice(0, 96);
}

export { validateSlugUniquenessByMode, sanitizeUrlSlug };
