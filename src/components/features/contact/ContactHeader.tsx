'use client';

import { AnimatePresence, motion } from 'motion/react';

interface ContactHeaderProps {
  isWedding: boolean;
}

export function ContactHeader({ isWedding }: ContactHeaderProps) {
  return (
    <motion.div
      initial={false}
      animate={{ color: isWedding ? 'var(--color-brown)' : 'var(--color-ivory-white)' }}
      className="mb-8 text-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isWedding ? 'wedding' : 'commercial'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {isWedding ? 'Tell us your love story' : 'Commercial Inquiry'}
          </h2>
          <p className="opacity-80">
            {isWedding
              ? 'We accept a limited number of weddings per year. Let’s see if we are a match.'
              : 'Ready to elevate your brand visual identity?'}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
