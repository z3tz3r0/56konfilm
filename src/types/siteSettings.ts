// Interface สำหรับข้อมูล Navigation ที่ดึงมา
interface NavItem {
  label: string;
  url: string;
}

export interface SiteSettings {
  siteTitle: string;
  productionNav: NavItem[];
  weddingNav: NavItem[];
  companyTitle: string;
  address: string;
  contactTitle: string;
  contacts: string;
  socialMediaTitle: string;
  socialLinks: NavItem[];
}
