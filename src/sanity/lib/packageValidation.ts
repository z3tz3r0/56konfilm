import type { ReferenceOptions, ValidationContext } from 'sanity';

/** Restricts catalog selection to the mode of the containing document. */
export const packageReferenceOptions: ReferenceOptions = {
  disableNew: true,
  filter: ({ document }) => ({
    filter: 'siteMode == $mode',
    params: { mode: document.siteMode ?? '' },
  }),
};

export function hasLocalizedPackageText(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) => typeof item?.value === 'string' && item.value.trim().length > 0
    )
  );
}

function referenceId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('_ref' in value)) return;
  return typeof value._ref === 'string' && value._ref.trim()
    ? value._ref.replace(/^drafts\./, '')
    : undefined;
}

/** Checks IDs, uniqueness, and mode in Studio; callers can skip inactive fields. */
export async function validatePackageReferences(
  value: unknown,
  context: ValidationContext,
  targetType: 'package' | 'packageService'
): Promise<true | string> {
  if (!Array.isArray(value) || value.length === 0)
    return 'กรุณาเลือกอย่างน้อยหนึ่งรายการ';

  const ids = value.map(referenceId);
  if (ids.some((id) => !id)) return 'กรุณาเลือกรายการให้ครบ';
  if (new Set(ids).size !== ids.length)
    return 'มีรายการซ้ำ กรุณาลบรายการที่ซ้ำออก';

  const mode = context.document?.siteMode;
  if (mode !== 'production' && mode !== 'wedding')
    return 'กรุณาสร้างข้อมูลผ่านเมนู Production หรือ Wedding';

  try {
    const documents = await context
      .getClient({ apiVersion: '2025-08-12' })
      .withConfig({ useCdn: false, perspective: 'raw' })
      .fetch<Array<{ _id: string; _type: string; siteMode?: string }>>(
        '*[_id in $ids]{_id, _type, siteMode}',
        { ids: ids.flatMap((id) => [id, `drafts.${id}`]) }
      );

    return ids.every((id) => {
      const target =
        documents.find((item) => item._id === `drafts.${id}`) ??
        documents.find((item) => item._id === id);
      return target?._type === targetType && target.siteMode === mode;
    })
      ? true
      : 'กรุณาเลือกรายการที่ยังมีอยู่และเป็นของโหมดเดียวกัน';
  } catch (error) {
    console.error('[Package Catalog Validation]', error);
    return 'ยังตรวจสอบรายการไม่ได้ กรุณาลองอีกครั้งก่อนเผยแพร่';
  }
}

/** Recap selections must be unique members of the package's service list. */
export function validateRecapHighlights(value: unknown, services: unknown) {
  if (value === undefined || (Array.isArray(value) && value.length === 0))
    return true;
  if (!Array.isArray(value)) return 'กรุณาเลือกรายการเด่นจากแพ็กเกจ';
  const ids = value.map(referenceId);
  const includedIds = new Set(
    Array.isArray(services) ? services.map(referenceId) : []
  );
  return ids.every((id) => id && includedIds.has(id)) &&
    new Set(ids).size === ids.length
    ? true
    : 'รายการเด่นต้องไม่ซ้ำ และต้องอยู่ในสิ่งที่รวมในแพ็กเกจนี้';
}
