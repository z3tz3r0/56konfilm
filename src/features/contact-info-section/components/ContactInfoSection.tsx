'use client';

import { m, type Variants } from 'motion/react';
import { AppIcon, SectionShell, SectionHeader } from '@shared/components';
import { DynamicLucideIcon } from '@shared/components/common/DynamicLucideIcon';
import { cn } from '@shared/utils';
import { useDeviceTier } from '@shared/hooks';
import { ContactForm } from '@features/contact-section/components';
import type { ContactInfoSectionBlock } from '../types';
import type { Locale, SiteMode } from '@shared/config';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const channelVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Stored data can bypass Studio validation. Never render executable CMS URLs.
function getSafeLink(value?: string, social = false) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const isExternal = url.protocol === 'https:' || url.protocol === 'http:';
    if (
      !isExternal &&
      (social || (url.protocol !== 'mailto:' && url.protocol !== 'tel:'))
    ) {
      return null;
    }
    return {
      href: url.href,
      target: isExternal ? ('_blank' as const) : undefined,
      rel: isExternal ? 'noopener noreferrer' : undefined,
    };
  } catch {
    return null;
  }
}

interface ContactInfoSectionProps {
  block: ContactInfoSectionBlock;
  lang?: Locale;
  mode?: SiteMode;
}

export default function ContactInfoSection({
  block,
  lang = 'en',
}: ContactInfoSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;
  const socialLinks = (block.socialLinks ?? []).flatMap((social, index) => {
    const link = getSafeLink(social.url, true);
    const label = social.label?.trim();
    return link && label ? [{ ...social, link, label, index }] : [];
  });
  const hasRightColumn =
    block.showForm || block.socialHeading || socialLinks.length > 0;

  return (
    <SectionShell
      background={block.background}
      dataTestId='contact-info-section'
      disablePadding
      className='px-4 py-16 lg:px-14'
    >
      <div
        className={cn('grid min-w-0 gap-8', hasRightColumn && 'lg:grid-cols-2')}
        data-testid='contact-layout'
      >
        <div
          className='flex min-w-0 flex-col gap-8'
          data-testid='contact-details'
        >
          {block.heading && (
            <SectionHeader
              heading={block.heading}
              className='items-center gap-4 text-center lg:items-start lg:text-left'
              headingClassName='text-text-primary text-4xl font-bold md:text-4xl lg:text-5xl wrap-anywhere'
              bodyClassName='text-text-secondary font-medium leading-normal whitespace-pre-wrap wrap-anywhere'
            />
          )}

          {(block.channels?.length ?? 0) > 0 && (
            <m.ul
              className='flex min-w-0 flex-col gap-8'
              initial={useLiteMotion ? false : 'hidden'}
              whileInView='visible'
              viewport={{ once: true, margin: '-60px' }}
              variants={useLiteMotion ? undefined : containerVariants}
            >
              {block.channels?.map((channel, index) => {
                const link = getSafeLink(channel.linkUrl);
                const Channel = link ? 'a' : 'div';
                const iconName = channel.iconPicker?.name?.trim();
                return (
                  <m.li
                    key={channel._key ?? index}
                    className='min-w-0'
                    variants={useLiteMotion ? undefined : channelVariants}
                  >
                    <Channel
                      {...(link ?? {})}
                      className='focus-visible:outline-ring flex min-w-0 items-start gap-4 rounded-lg outline-offset-4 focus-visible:outline-2 lg:gap-8'
                      data-testid='contact-channel-card'
                    >
                      {(iconName || channel.icon) && (
                        <span aria-hidden='true' className='shrink-0'>
                          <AppIcon
                            iconName={iconName}
                            className='bg-primary text-primary-foreground mx-0 p-4'
                            iconClassName='size-full'
                          >
                            {channel.icon && !iconName && (
                              <DynamicLucideIcon
                                name={channel.icon}
                                className='size-full'
                                strokeWidth={1.5}
                              />
                            )}
                          </AppIcon>
                        </span>
                      )}
                      <div className='flex min-w-0 flex-1 flex-col gap-2'>
                        {channel.label && (
                          <h3 className='text-text-primary text-2xl font-bold wrap-anywhere lg:text-4xl'>
                            {channel.label}
                          </h3>
                        )}
                        {channel.value && (
                          <p className='text-text-secondary leading-normal font-medium wrap-anywhere whitespace-pre-wrap'>
                            {channel.value}
                          </p>
                        )}
                      </div>
                    </Channel>
                  </m.li>
                );
              })}
            </m.ul>
          )}
        </div>

        {hasRightColumn && (
          <div
            className='flex min-w-0 flex-col gap-8 lg:px-6 lg:pt-6'
            data-testid='contact-form-social'
          >
            {block.showForm && (
              <ContactForm lang={lang} presentation='embedded' />
            )}
            {(block.socialHeading || socialLinks.length > 0) && (
              <div
                className='flex min-w-0 flex-col gap-4'
                data-testid='contact-social'
              >
                {block.socialHeading && (
                  <h3 className='text-text-primary text-center text-4xl font-bold wrap-anywhere lg:text-left'>
                    {block.socialHeading}
                  </h3>
                )}
                {socialLinks.length > 0 && (
                  <ul className='flex flex-wrap items-center justify-center gap-4 lg:justify-start'>
                    {socialLinks.map((social) => (
                      <li key={social._key ?? social.index} className='min-w-0'>
                        <a
                          {...social.link}
                          aria-label={social.label}
                          className='text-text-primary focus-visible:outline-ring block rounded-sm outline-offset-4 focus-visible:outline-2'
                        >
                          {social.icon?.name?.trim() ? (
                            <span aria-hidden='true'>
                              <AppIcon
                                iconName={social.icon.name}
                                variant='plain'
                              />
                            </span>
                          ) : (
                            <span className='wrap-anywhere'>
                              {social.label}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
