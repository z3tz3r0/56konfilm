'use client';

import { m, type Variants } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { type LucideProps } from 'lucide-react';
import { SectionShell, SectionHeader } from '@shared/components';
import { cn } from '@shared/utils';
import { useDeviceTier } from '@shared/hooks';
import { ContactForm } from '@features/contact-section/components';
import { ContactInfoSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>
  )[name];
  return Icon ? <Icon {...props} /> : null;
}

interface ContactInfoSectionProps {
  block: ContactInfoSectionBlock;
}

export default function ContactInfoSection({ block }: ContactInfoSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  const colClass = cn(
    'grid gap-4',
    block.channels?.length === 2
      ? 'sm:grid-cols-2'
      : block.channels?.length === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4'
  );

  return (
    <SectionShell
      background={block.background}
      dataTestId="contact-info-section"
    >
      <div className="container mx-auto">
        {block.heading && (
          <SectionHeader heading={block.heading} className="mb-12" />
        )}

        {block.channels?.length ? (
          <m.div
            className={colClass}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={useLiteMotion ? undefined : containerVariants}
          >
            {block.channels.map((channel, index) => {
              const card = (
                <m.div
                  key={channel._key ?? index}
                  className={cn(
                    'border-border bg-card group flex flex-col gap-4 rounded-xl border p-6 transition-colors',
                    channel.linkUrl
                      ? 'hover:border-primary/40 cursor-pointer'
                      : ''
                  )}
                  variants={useLiteMotion ? undefined : cardVariants}
                  data-testid="contact-channel-card"
                >
                  {channel.icon && (
                    <span className="text-primary bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <DynamicIcon
                        name={channel.icon}
                        size={20}
                        strokeWidth={1.5}
                      />
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    {channel.label && (
                      <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                        {channel.label}
                      </span>
                    )}
                    {channel.value && (
                      <span className="text-foreground text-sm font-medium break-all">
                        {channel.value}
                      </span>
                    )}
                  </div>
                </m.div>
              );

              return channel.linkUrl ? (
                <a
                  key={channel._key ?? index}
                  href={channel.linkUrl}
                  target={
                    channel.linkUrl.startsWith('http') ? '_blank' : undefined
                  }
                  rel={
                    channel.linkUrl.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  className="contents"
                >
                  {card}
                </a>
              ) : (
                card
              );
            })}
          </m.div>
        ) : null}

        {block.showForm && (
          <div className="border-border mt-16 border-t pt-16">
            <ContactForm />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
