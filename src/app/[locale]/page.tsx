import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Navbar from '@/components/Navbar';

const HomePage = () => {
  const t = useTranslations('HomePage');
  return (
    <div className="container mx-auto">
      <Navbar />
      <h1>{t('title')}</h1>
      <Link href="/about">{t('about')}</Link>
    </div>
  );
};

export default HomePage;
