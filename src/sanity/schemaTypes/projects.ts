import { defineField, defineType } from 'sanity';
import {
  ImageAssetValue,
  SanityValidationContext,
  validateImageAssetSizeWarning,
} from './objects/backgroundMedia';
import { localizedStringField, localizedTextField } from './objects/localized';
import { sanitizeUrlSlug } from '../lib/slug';

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'details', title: 'Project Details' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- 📌 MAIN GROUP (ข้อมูลหลักและเนื้อหา) ---
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
        slugify: sanitizeUrlSlug,
      },
      validation: (Rule) =>
        Rule.required().error(
          'URL Slug is required for the project to be viewable on the site.'
        ),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      description:
        'รูปภาพหน้าปกที่จะใช้แสดงในหน้า Portfolio Grid และเป็นภาพแรกที่คนจะเห็น ควรใช้รูปภาพคุณภาพสูงที่สื่อถึงงานได้ดีที่สุด',
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
        Rule.required().min(1).error('Please select at least one mode.'),
    }),
    localizedTextField({
      name: 'overview',
      title: 'Overview',
      description:
        'รายละเอียดหรือบทสรุปสั้นๆ ของโปรเจกต์ (แนะนำให้เขียนให้น่าสนใจและมีคีย์เวิร์ดที่เกี่ยวข้อง เพื่อช่วยให้ Search Engine ตรวจเจอได้ดีขึ้น)',
      group: 'main',
    }),
    defineField({
      name: 'body',
      title: 'Project Content',
      description:
        'เขียนรายละเอียดของผลงานชิ้นนี้ (รองรับการจัดรูปแบบข้อความและแทรกรูปภาพประกอบเหมือนการเขียนบล็อก)',
      group: 'main',
      type: 'blockContent',
    }),
    // --- 📝 PROJECT DETAILS GROUP (ข้อมูลประกอบผลงาน) ---
    defineField({
      name: 'client',
      title: 'Client',
      description: 'ชื่อลูกค้าหรือแบรนด์เจ้าของงาน (เช่น Toyota, PTT, SCG)',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'projectDate',
      title: 'Project Date',
      description:
        'วันที่จัดงานหรือผลิตผลงานชิ้นนี้ (ระบบจะใช้ข้อมูลนี้สำหรับจัดเรียงผลงานจากใหม่ไปเก่าให้อัตโนมัติ)',
      type: 'date',
      group: 'details',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: (Rule) =>
        Rule.required().error('Please specify the date of the project.'),
    }),
    defineField({
      name: 'services',
      title: 'Services',
      description:
        'ระบุบริการที่เกี่ยวข้อง (เช่น Video Production, Cinematic Editing, Color Grading) ช่วยให้คนเข้าใจขอบเขตงานได้ง่ายขึ้น',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description:
        'เลือกหมวดหมู่ของผลงานนี้ (ใช้สำหรับจัดกลุ่มและทำ Filter ในหน้า Portfolio)',
      type: 'array',
      group: 'details',
      of: [
        {
          type: 'reference',
          to: [{ type: 'projectTag' }],
        },
      ],
      validation: (Rule) =>
        Rule.unique().error('Duplicate tags cannot be selected.'),
    }),
    // --- 🔍 SEO GROUP ---
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
