import { useTranslations } from 'next-intl';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const Navbar = () => {
  const t = useTranslations('Navbar');

  return (
    <>
      <div className="flex justify-between py-8">
        <h1>Logo</h1>
        <Tabs>
          <TabsList>
            <TabsTrigger value="production">{t('production')}</TabsTrigger>
            <TabsTrigger value="wedding">{t('wedding')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-8">
          <Link href="/about">{t('about')}</Link>
          <Link href="/portfolio">{t('portfolio')}</Link>
          <Link href="/services">{t('services')}</Link>
          <Link href="/contact">{t('contact')}</Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
