import {
  getPublishedId,
  type ReferenceOptions,
  type ValidationContext,
} from 'sanity';
import {
  catalogReferenceId,
  PACKAGE_CATALOG_API_VERSION,
} from './packageCatalog';

/** Restricts catalog selection to the mode of the containing document. */
export const packageReferenceOptions: ReferenceOptions = {
  disableNew: true,
  filter: ({ document }) => ({
    filter:
      'siteMode == $mode && !(_id in path("drafts.**")) && !(_id in path("versions.**"))',
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

/** Checks IDs, uniqueness, and mode in Studio; callers can skip inactive fields. */
export async function validatePackageReferences(
  value: unknown,
  context: ValidationContext,
  targetType: 'package' | 'packageService' | 'packageGroup'
): Promise<true | string> {
  if (!Array.isArray(value) || value.length === 0)
    return 'กรุณาเลือกอย่างน้อยหนึ่งรายการ';

  const ids = value.map(catalogReferenceId);
  if (ids.some((id) => !id)) return 'กรุณาเลือกรายการให้ครบ';
  if (new Set(ids).size !== ids.length)
    return 'มีรายการซ้ำ กรุณาลบรายการที่ซ้ำออก';

  const mode = context.document?.siteMode;
  if (mode !== 'production' && mode !== 'wedding')
    return 'กรุณาสร้างข้อมูลผ่านเมนู Production หรือ Wedding';

  try {
    const documents = await context
      .getClient({ apiVersion: PACKAGE_CATALOG_API_VERSION })
      .withConfig({ useCdn: false, perspective: 'published' })
      .fetch<
        Array<{ _id: string; _type: string; siteMode?: string }>
      >('*[_id in $ids && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{_id, _type, siteMode}', { ids });

    return ids.every((id) => {
      const target = documents.find((item) => item._id === id);
      return target?._type === targetType && target.siteMode === mode;
    })
      ? true
      : 'กรุณาเลือกรายการที่เผยแพร่แล้วและเป็นของโหมดเดียวกัน';
  } catch (error) {
    console.error('[Package Catalog Validation]', error);
    return 'ยังตรวจสอบรายการไม่ได้ กรุณาลองอีกครั้งก่อนเผยแพร่';
  }
}

/** Highlights remain editor-selected, but membership belongs to Services. */
export async function validateRecapHighlights(
  value: unknown,
  context: ValidationContext
) {
  if (value === undefined || (Array.isArray(value) && value.length === 0))
    return true;
  if (!Array.isArray(value)) return 'กรุณาเลือกรายการเด่นจากแพ็กเกจ';
  const referenceValidation = await validatePackageReferences(
    value,
    context,
    'packageService'
  );
  if (referenceValidation !== true) return referenceValidation;
  const packageId = context.document?._id
    ? getPublishedId(context.document._id)
    : undefined;
  if (!packageId) return 'กรุณาสร้างแพ็กเกจก่อนเลือกรายการเด่น';
  try {
    const ids = value.map(catalogReferenceId);
    const includedIds = await context
      .getClient({ apiVersion: PACKAGE_CATALOG_API_VERSION })
      .withConfig({ useCdn: false, perspective: 'published' })
      .fetch<
        string[]
      >('*[_type == "packageService" && siteMode == $mode && _id in $ids && $packageId in packages[]._ref]._id', { ids, mode: context.document?.siteMode, packageId });
    return ids.every((id) => id && includedIds.includes(id))
      ? true
      : 'รายการเด่นต้องอยู่ในบริการที่เลือกแพ็กเกจนี้';
  } catch (error) {
    console.error('[Package Highlights Validation]', error);
    return 'ยังตรวจสอบรายการเด่นไม่ได้ กรุณาลองอีกครั้งก่อนเผยแพร่';
  }
}
