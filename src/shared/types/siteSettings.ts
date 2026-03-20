import { ImageSource } from './sanity';
import { SeoFields } from './page';

// Interface สำหรับข้อมูล Navigation ที่ดึงมา
interface NavItem {
  label: string;
  url: string;
}

export interface SiteSettings {
  favicon?: ImageSource;
  siteTitle?: string;
  seo?: SeoFields;
  productionNav?: NavItem[];
  productionPortfolioPage: string;
  weddingNav?: NavItem[];
  weddingPortfolioPage: string;
  companyTitle?: string;
  address?: string;
  contactTitle?: string;
  contacts?: string;
  socialMediaTitle?: string;
  socialLinks?: NavItem[];
}
