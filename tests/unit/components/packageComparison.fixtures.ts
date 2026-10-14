import type { Locale } from '@shared/config/preferences';
import type { PackageComparisonSectionBlock } from '@features/package-comparison-section';

export function comparisonFixture(
  lang: Locale = 'en'
): PackageComparisonSectionBlock {
  const th = lang === 'th';
  const cta = {
    label: th ? 'เริ่มต้น' : 'Get started',
    style: 'secondary' as const,
    linkType: 'internal' as const,
    pageRef: { slug: 'contact' },
  };
  return {
    _key: 'comparison',
    _type: 'packageComparisonSection',
    heading: {
      eyebrow: th ? 'แพ็กเกจ' : 'Packages',
      heading: th ? 'เลือกแพ็กเกจของคุณ' : 'Find your perfect fit',
      body: th ? 'เลือกให้เหมาะกับงานของคุณ' : 'Choose your package',
      align: 'center',
    },
    groups: [
      {
        _key: 'budget',
        slug: 'budget-friendly',
        label: th ? 'คุ้มค่า' : 'Budget friendly',
        packages: [
          {
            _id: 'basic',
            title: th ? 'เริ่มต้น' : 'Essential',
            price: 0,
            currency: 'THB',
            cta,
            serviceIds: ['photo'],
          },
          {
            _id: 'popular',
            title: th ? 'ยอดนิยม' : 'Cherish',
            price: 2000,
            currency: 'THB',
            badgeLabel: th ? 'ยอดนิยมที่สุด' : 'MOST POPULAR',
            cta: { ...cta, style: 'primary' },
            serviceIds: ['photo', 'film'],
          },
        ],
        rows: [
          {
            _id: 'photo',
            title: th ? 'ภาพถ่าย' : 'Photography',
            information: th
              ? 'ถ่ายภาพตลอดงาน\nส่งไฟล์ภาพ'
              : 'Full day coverage\nDigital delivery',
          },
          { _id: 'film', title: th ? 'วิดีโอ' : 'Film' },
        ],
      },
      {
        _key: 'premium',
        slug: 'luxury',
        label: th ? 'พรีเมียม' : 'Luxury',
        packages: [
          {
            _id: 'premium',
            title: th ? 'ครบชุด' : 'Complete',
            price: 5000,
            currency: 'THB',
            cta: {
              ...cta,
              style: 'neutral',
              linkType: 'external',
              pageRef: undefined,
              externalUrl: 'https://example.com/inquire',
            },
            serviceIds: ['drone'],
          },
        ],
        rows: [
          {
            _id: 'drone',
            title: th ? 'โดรน' : 'Drone',
            information: th ? 'ภาพมุมสูง' : 'Aerial footage',
          },
        ],
      },
    ],
  };
}
