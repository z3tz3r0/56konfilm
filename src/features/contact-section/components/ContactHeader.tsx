'use client';

import { AnimatePresence, m } from 'motion/react';
import type { Locale } from '@shared/config/preferences';
import { contactFormCopy } from '../formCopy';

interface ContactHeaderProps {
  isWedding: boolean;
  lang?: Locale;
}

export function ContactHeader({ isWedding, lang = 'en' }: ContactHeaderProps) {
  const copy = contactFormCopy[lang];
  return (
    <m.div
      initial={false}
      animate={{
        color: isWedding ? 'var(--color-brown)' : 'var(--color-ivory-white)',
      }}
      className='mb-8 text-center'
    >
      <AnimatePresence mode='wait'>
        <m.div
          key={isWedding ? 'wedding' : 'commercial'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <h2 className='mb-2 text-3xl font-bold tracking-tight'>
            {isWedding ? copy.weddingHeading : copy.commercialHeading}
          </h2>
          <p className='opacity-80'>
            {isWedding ? copy.weddingIntroduction : copy.commercialIntroduction}
          </p>
        </m.div>
      </AnimatePresence>
    </m.div>
  );
}
