import { Path, SanityDocument } from 'sanity';

export function getParentSectionFromPath(
  document: SanityDocument | undefined,
  path: Path | undefined
) {
  if (!document || !path) return undefined;

  // 1. แกะรอยหา _key ของ Section แม่ จากเส้นทาง path (GPS)
  // find จะวิ่งหา segment ที่เป็น object และมี property '_key'
  const sectionSegment = path.find(
    (segment) =>
      typeof segment === 'object' && segment !== null && '_key' in segment
  );

  const sectionKey = sectionSegment?._key;
  if (!sectionKey) return undefined;

  // 2. ดึง Section ทั้งหมดในหน้าเว็บนั้นมารวมกัน (ปรับแต่งได้ตาม Schema ของคุณ)
  const allSections = [
    ...(Array.isArray(document.commercialSections)
      ? document.commercialSections
      : []),
    ...(Array.isArray(document.weddingSections)
      ? document.weddingSections
      : []),
  ];

  // 3. จับคู่ _key ที่ได้จาก Path กับ Section ที่มีอยู่จริง
  return allSections.find((sec) => sec._key === sectionKey);
}
