import {
  getPublishedId,
  type SanityDocument,
  type SlugValidationContext,
} from 'sanity';
import { PACKAGE_CATALOG_API_VERSION } from './packageCatalog';

/** Generating is an explicit editor action; changing a label never changes a URL. */
export function packageGroupSlugSource(document: SanityDocument): string {
  const label = document.label;
  if (!Array.isArray(label)) return '';
  const english = label.find(
    (entry) => entry?.language === 'en' || entry?._key === 'en'
  );
  return typeof english?.value === 'string' ? english.value : '';
}

export function validatePackageGroupSlug(value: unknown): true | string {
  const current =
    value && typeof value === 'object' && 'current' in value
      ? value.current
      : undefined;
  if (typeof current !== 'string' || !current.trim())
    return 'กรุณากรอก URL Slug ก่อนเผยแพร่กลุ่มแพ็กเกจ';
  if (current.length > 96) return 'URL Slug ต้องยาวไม่เกิน 96 ตัวอักษร';
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)
    ? true
    : 'URL Slug ใช้ภาษาอังกฤษตัวเล็ก ตัวเลข และขีดกลางคั่นคำเท่านั้น';
}

/** Reserve slugs in both published and draft Groups within the same site mode. */
export async function isPackageGroupSlugUnique(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  if (validatePackageGroupSlug({ current: slug }) !== true) return false;
  const { document } = context;
  const mode = document?.siteMode;
  if (!document?._id || (mode !== 'production' && mode !== 'wedding'))
    return false;

  try {
    const published = getPublishedId(document._id);
    const available = await context
      .getClient({ apiVersion: PACKAGE_CATALOG_API_VERSION })
      .withConfig({ useCdn: false, perspective: 'raw' })
      .fetch<boolean>(
        `!defined(*[
          _type == "packageGroup" && siteMode == $mode && slug.current == $slug &&
          !(_id in $excludedIds) && !(_id in path("versions.**"))
        ][0]._id)`,
        { slug, mode, excludedIds: [published, `drafts.${published}`] }
      );
    return available === true;
  } catch (error) {
    console.error('[Package Group Slug Validation]', error);
    return false;
  }
}
