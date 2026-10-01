import { defineField, defineType, defineArrayMember } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';
import { localizedBlockType, localizedStringField } from '../objects/localized';
import { contactChannelType } from '../objects/contactChannel';
import { socialMediaType } from '../objects/socialMedia';
import { ctaStyleField } from '../objects/cta';
import { isGoogleMapsEmbedUrl } from '@shared/utils/url/googleMaps';
import { GoogleMapsEmbedUrlInput } from '../../components/inputs/GoogleMapsEmbedUrlInput';
import type { Path } from 'sanity';

interface StoredSocialLink {
  _key?: string;
  label?: Array<{ _key?: string; value?: string }>;
}

export const contactSectionType = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วน Contact',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'channels',
      title: 'Contact Channels',
      description: 'ช่องทางการติดต่อ (แนะนำ 2-4 ช่องทาง)',
      type: 'array',
      of: [defineArrayMember({ type: contactChannelType.name })],
      validation: (Rule) => Rule.min(1).max(6),
    }),
    defineField({
      name: 'showForm',
      title: 'Show Contact Form',
      description: 'แสดงฟอร์มคู่กับข้อมูลติดต่อบน Desktop และเรียงลงบน Mobile',
      type: 'boolean',
      initialValue: true,
    }),
    localizedStringField({
      name: 'socialHeading',
      title: 'Social Heading',
      description: 'หัวข้อสำหรับช่องทางโซเชียลมีเดีย',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      description: 'ไอคอนและลิงก์โซเชียลมีเดียสำหรับ Contact Section นี้',
      type: 'array',
      of: [defineArrayMember({ type: socialMediaType.name })],
      validation: (Rule) =>
        Rule.custom<StoredSocialLink[]>((links) => {
          const paths: Path[] = [];
          for (const [index, link] of (links ?? []).entries()) {
            const linkPath = link._key ? { _key: link._key } : index;
            if (!Array.isArray(link.label) || link.label.length === 0) {
              paths.push([linkPath, 'label']);
              continue;
            }
            for (const [labelIndex, label] of link.label.entries()) {
              if (typeof label.value !== 'string' || !label.value.trim()) {
                paths.push([
                  linkPath,
                  'label',
                  label._key ? { _key: label._key } : labelIndex,
                  'value',
                ]);
              }
            }
          }
          return paths.length
            ? {
                message:
                  'Enter a social link name for each added language. Empty names or whitespace-only names are not allowed.',
                paths,
              }
            : true;
        }).error(),
    }),
    defineField({
      name: 'submitButton',
      title: 'Submit Button',
      description: 'ข้อความและรูปแบบปุ่มส่งฟอร์ม ไม่ใช่ปุ่มลิงก์ไปหน้าอื่น',
      type: 'object',
      fields: [
        localizedStringField({
          name: 'label',
          title: 'Label',
          description:
            'ข้อความบนปุ่มส่งฟอร์ม หากไม่ระบุจะใช้ข้อความเริ่มต้นของฟอร์ม',
        }),
        ctaStyleField,
        defineField({
          name: 'size',
          title: 'Size',
          description: 'ขนาดปุ่มตามตัวเลือกของ Button ที่มีอยู่แล้ว',
          type: 'string',
          options: {
            list: [
              { title: 'Default', value: 'default' },
              { title: 'Small', value: 'sm' },
              { title: 'Medium', value: 'md' },
              { title: 'Large', value: 'lg' },
            ],
          },
          initialValue: 'default',
        }),
      ],
    }),
    defineField({
      name: 'map',
      title: 'Google Map',
      description: 'สถานที่ตั้งที่แสดงใต้ Contact Section',
      type: 'object',
      fields: [
        defineField({
          name: 'embedUrl',
          title: 'Google Maps Embed URL',
          description:
            'บนคอมพิวเตอร์ เปิด Google Maps และค้นหาสถานที่ → กด "แชร์" → เลือก "ฝังแผนที่" → กด "คัดลอก HTML" แล้ววางในช่องได้เลย ระบบจะเก็บเฉพาะลิงก์แผนที่ให้เอง หรือจะคัดลอกลิงก์ฝังแผนที่ที่ขึ้นต้นด้วย https://www.google.com/maps/embed? และวางเองแบบ Manual ก็ได้ (ปล. ลิงก์จาก "ส่งลิงก์" ใช้ไม่ได้ ต้องเป็นลิงก์จาก "ฝังแผนที่" เท่านั้น)',
          type: 'url',
          components: { input: GoogleMapsEmbedUrlInput },
          validation: (Rule) =>
            Rule.uri({ scheme: ['https'] }).custom((value) => {
              if (!value) return true;
              return (
                isGoogleMapsEmbedUrl(value) ||
                'ใช้ลิงก์ฝังแผนที่จาก Google Maps เท่านั้น'
              );
            }),
        }),
        localizedStringField({
          name: 'title',
          title: 'Map Title',
          description: 'ชื่อแผนที่สำหรับผู้ใช้ screen reader',
        }),
      ],
    }),
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
  ],
  preview: {
    select: {
      title: 'heading.heading.0.value',
      channels: 'channels',
      showForm: 'showForm',
    },
    /**
     * Returns the Studio preview with a "Contact Section" fallback for a falsy
     * title, a channel count (zero for non-arrays), and a form indicator when enabled.
     */
    prepare({ title, channels, showForm }) {
      const count = Array.isArray(channels) ? channels.length : 0;
      return {
        title: title || 'Contact Section',
        subtitle: `${count} channel${count === 1 ? '' : 's'}${showForm ? ' · with form' : ''}`,
      };
    },
  },
});
