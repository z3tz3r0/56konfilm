import { defineField, defineType } from 'sanity';
import {
  ImageAssetValue,
  SanityValidationContext,
  validateImageAssetSizeWarning,
} from './objects/backgroundMedia';
import { localizedStringField, localizedTextField } from './objects/localized';

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'content', title: 'Page Builder' },
    { name: 'metadata', title: 'Project Metadata' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description:
        'ชื่อโปรเจกต์ (จะแสดงเป็นหัวข้อหลักของหน้า และใช้เป็นชื่อสำหรับ SEO หากไม่ได้ตั้งค่าแยกต่างหาก แนะนำให้ใส่คีย์เวิร์ดสำคัญที่คนมักจะค้นหา)',
      group: 'main',
      validation: (Rule) =>
        Rule.required().error('Project title is required before publishing.'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'ส่วนของ URL ที่ระบุโปรเจกต์นี้ (เช่น "my-awesome-project") ควรเป็นภาษาอังกฤษตัวเล็กและขีดกลางเท่านั้น พยายามให้สั้นและสื่อความหมายเพื่อผลดีต่อ SEO',
      type: 'slug',
      group: 'main',
      options: {
        source: 'title.0.value',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().error(
          'URL Slug is required for the project to be viewable on the site.'
        ),
    }),
    defineField({
      name: 'siteMode',
      title: 'Site Mode',
      description:
        'เลือกโหมดที่ต้องการให้โปรเจกต์นี้แสดงผล (สามารถเลือกได้ทั้งคู่หากเป็นงานที่เข้าข่ายทั้ง Production และ Wedding)',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Production', value: 'production' },
          { title: 'Wedding', value: 'wedding' },
        ],
      },
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error(
            'At least one site mode (Production/Wedding) must be selected.'
          ),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      description: 'ชื่อลูกค้าหรือแบรนด์เจ้าของงาน (เช่น Toyota, PTT, SCG)',
      type: 'string',
      group: 'metadata',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      description: 'ปีที่ผลิตหรือปีที่จัดงาน (เช่น "2024", "2025")',
      type: 'string',
      group: 'metadata',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      description:
        'ระบุบริการที่เกี่ยวข้อง (เช่น Video Production, Cinematic Editing, Color Grading) ช่วยให้คนเข้าใจขอบเขตงานได้ง่ายขึ้น',
      type: 'array',
      group: 'metadata',
      of: [{ type: 'string' }],
    }),
    localizedTextField({
      name: 'overview',
      title: 'Overview',
      description:
        'รายละเอียดหรือบทสรุปสั้นๆ ของโปรเจกต์ (แนะนำให้เขียนให้น่าสนใจและมีคีย์เวิร์ดที่เกี่ยวข้อง เพื่อช่วยให้ Search Engine ตรวจเจอได้ดีขึ้น)',
      group: 'main',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      description:
        'รูปภาพหน้าปกที่จะใช้แสดงในหน้า Gallery และเป็นภาพแรกที่คนจะเห็น ควรใช้รูปภาพคุณภาพสูงที่สื่อถึงงานได้ดีที่สุด',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateImageAssetSizeWarning(
            value as ImageAssetValue | undefined,
            context as SanityValidationContext
          )
        ).warning(),
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      description:
        'ส่วนสำหรับจัดการเนื้อหาภายในหน้าโปรเจกต์ สามารถเพิ่มรูปภาพหรือวิดีโอเพิ่มเติมในรูปแบบ Magazine Layout ได้',
      group: 'content',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'mediaGallerySection' },
        { type: 'twoColumnSection' },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      description: 'วันที่เผยแพร่ (ใช้สำหรับจัดลำดับการแสดงผลของโปรเจกต์)',
      type: 'datetime',
      group: 'metadata',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      description:
        'การตั้งค่า Meta Tags สำหรับการแชร์ลง Social Media หรือการแสดงผลบน Google แบบเฉพาะเจาะจง (หากไม่ใส่ ระบบจะดึงข้อมูลจาก Title และ Overview ให้อัตโนมัติ)',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      subtitle: 'client',
      media: 'coverImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Project',
        subtitle: subtitle || 'No client specified',
        media,
      };
    },
  },
});
