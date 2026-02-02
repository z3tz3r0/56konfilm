import { SiteSettings } from '@/types/siteSettings';
import Link from 'next/link';

interface FooterProps {
  settings: SiteSettings;
}

const Footer = ({ settings }: FooterProps) => {
  const {
    address,
    companyTitle,
    contactTitle,
    contacts,
    socialLinks,
    socialMediaTitle,
  } = settings;

  return (
    <footer className="bg-foreground text-background p-4 py-16">
      <section className="container mx-auto grid max-w-[1280px] grid-cols-3 gap-y-16">
        <div id="company-details" className="col-span-3">
          <h4>{companyTitle}</h4>
          <address>{address}</address>
        </div>

        <div id="contacts" className="col-span-2">
          <h4>{contactTitle}</h4>
          <p className="whitespace-pre-wrap">{contacts}</p>
        </div>

        <div id="social-media-links" className="text-right">
          <h4>{socialMediaTitle}</h4>
          <p>
            {socialLinks.map((link, idx) => (
              <Link key={idx} href={link.url}>
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      </section>
      <p className="col-span-3 text-center pt-16">{companyTitle} || All right reserved ©</p>
    </footer>
  );
};

export default Footer;
