# New CMS Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new reusable CMS section types (StatsCounter, Team, FAQ, VideoShowreel) with Sanity schemas, GROQ queries, and frontend components — following existing conventions exactly.

**Architecture:** Each section follows the established feature-module pattern: `src/features/{name}/components/`, `types/`, barrel exports. Sanity schemas use `defineType`/`defineField`/`defineArrayMember`. GROQ fragments slot into the existing section projection system. shadcn primitives (Accordion, Avatar, AspectRatio) provide accessible UI foundations.

**Tech Stack:** Next.js 16, Sanity v3, TypeScript, Tailwind CSS v4, shadcn/ui, Motion (framer-motion), `next/image`

---

## File Map

### New Files

```
# Sanity schemas (4 section types + 4 object types)
src/sanity/schemaTypes/sections/statsCounterSection.ts
src/sanity/schemaTypes/sections/teamSection.ts
src/sanity/schemaTypes/sections/faqSection.ts
src/sanity/schemaTypes/sections/videoShowreelSection.ts
src/sanity/schemaTypes/objects/statItem.ts
src/sanity/schemaTypes/objects/teamMember.ts
src/sanity/schemaTypes/objects/faqItem.ts

# Frontend feature modules (4 sections)
src/features/stats-counter-section/components/StatsCounterSection.tsx
src/features/stats-counter-section/components/index.ts
src/features/stats-counter-section/types/statsCounterBlock.types.ts
src/features/stats-counter-section/types/index.ts
src/features/stats-counter-section/index.ts

src/features/team-section/components/TeamSection.tsx
src/features/team-section/components/index.ts
src/features/team-section/types/teamBlock.types.ts
src/features/team-section/types/index.ts
src/features/team-section/index.ts

src/features/faq-section/components/FAQSection.tsx
src/features/faq-section/components/index.ts
src/features/faq-section/types/faqBlock.types.ts
src/features/faq-section/types/index.ts
src/features/faq-section/index.ts

src/features/video-showreel-section/components/VideoShowreelSection.tsx
src/features/video-showreel-section/components/index.ts
src/features/video-showreel-section/types/videoShowreelBlock.types.ts
src/features/video-showreel-section/types/index.ts
src/features/video-showreel-section/index.ts

# shadcn components to install
src/components/ui/accordion.tsx   (via shadcn CLI)
src/components/ui/avatar.tsx      (via shadcn CLI)
src/components/ui/aspect-ratio.tsx (via shadcn CLI)
```

### Modified Files

```
src/sanity/schemaTypes/index.ts          # Register new types
src/sanity/schemaTypes/page.ts           # Add new sections to page arrays
src/sanity/lib/queries/sections.ts       # Add GROQ fragments
src/sanity/lib/queries.ts                # Add fragments to page/project queries
src/features/PageBuilder.tsx             # Route new section types
src/shared/types/pageBlock.ts            # Add block types to union (if applicable)
```

---

## Task 1: Install shadcn Primitives

**Files:**
- Create: `src/components/ui/accordion.tsx`
- Create: `src/components/ui/avatar.tsx`
- Create: `src/components/ui/aspect-ratio.tsx`

- [ ] **Step 1: Install accordion, avatar, aspect-ratio**

```bash
pnpm dlx shadcn@latest add accordion avatar aspect-ratio
```

- [ ] **Step 2: Verify installation**

```bash
ls src/components/ui/accordion.tsx src/components/ui/avatar.tsx src/components/ui/aspect-ratio.tsx
```

Expected: all 3 files exist.

- [ ] **Step 3: Type-check**

```bash
pnpm run type-check
```

Expected: PASS (no new errors).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/accordion.tsx src/components/ui/avatar.tsx src/components/ui/aspect-ratio.tsx
git commit -m "chore(ui): install shadcn accordion, avatar, aspect-ratio primitives"
```

---

## Task 2: Sanity Object Schemas (statItem, teamMember, faqItem)

These are the reusable object types that live inside the new section arrays.

**Files:**
- Create: `src/sanity/schemaTypes/objects/statItem.ts`
- Create: `src/sanity/schemaTypes/objects/teamMember.ts`
- Create: `src/sanity/schemaTypes/objects/faqItem.ts`

- [ ] **Step 1: Create statItem object**

```typescript
// src/sanity/schemaTypes/objects/statItem.ts
import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';

export const statItemType = defineType({
  name: 'statItem',
  title: 'Stat Item',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      description: 'ตัวเลขที่แสดง เช่น "200", "10", "50"',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'suffix',
      title: 'Suffix',
      description: 'ข้อความต่อท้ายตัวเลข เช่น "+", "%", "K"',
      type: 'string',
    }),
    localizedStringField({
      name: 'label',
      title: 'Label',
      description: 'คำอธิบายตัวเลข เช่น "Projects Completed"',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { value: 'value', suffix: 'suffix', label: 'label.0.value' },
    prepare({ value, suffix, label }) {
      return { title: `${value ?? ''}${suffix ?? ''}`, subtitle: label ?? 'Stat' };
    },
  },
});
```

- [ ] **Step 2: Create teamMember object**

```typescript
// src/sanity/schemaTypes/objects/teamMember.ts
import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons';
import { localizedStringField, localizedTextField } from './localized';

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'ชื่อสมาชิก',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'role',
      title: 'Role',
      description: 'ตำแหน่ง เช่น "Director of Photography"',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'bio',
      title: 'Bio',
      description: 'ประวัติย่อ (ไม่จำเป็น)',
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      description: 'รูปถ่ายสมาชิก (แนะนำอัตราส่วน 1:1)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role.0.value', media: 'image' },
  },
});
```

- [ ] **Step 3: Create faqItem object**

```typescript
// src/sanity/schemaTypes/objects/faqItem.ts
import { defineType } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';
import { localizedStringField, localizedTextField } from './localized';

export const faqItemType = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    localizedStringField({
      name: 'question',
      title: 'Question',
      description: 'คำถาม',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'answer',
      title: 'Answer',
      description: 'คำตอบ',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'question.0.value' },
    prepare({ title }) {
      return { title: title || 'Untitled FAQ', subtitle: 'FAQ' };
    },
  },
});
```

- [ ] **Step 4: Register objects in schema index**

Read `src/sanity/schemaTypes/index.ts`, then add the 3 new object types to the `schemaTypes` array alongside existing object exports. Import them from their files and add to the exported array.

- [ ] **Step 5: Commit**

```bash
git add src/sanity/schemaTypes/objects/statItem.ts src/sanity/schemaTypes/objects/teamMember.ts src/sanity/schemaTypes/objects/faqItem.ts src/sanity/schemaTypes/index.ts
git commit -m "feat(sanity): add statItem, teamMember, faqItem object schemas"
```

---

## Task 3: Sanity Section Schemas (4 new sections)

**Files:**
- Create: `src/sanity/schemaTypes/sections/statsCounterSection.ts`
- Create: `src/sanity/schemaTypes/sections/teamSection.ts`
- Create: `src/sanity/schemaTypes/sections/faqSection.ts`
- Create: `src/sanity/schemaTypes/sections/videoShowreelSection.ts`

- [ ] **Step 1: Create statsCounterSection schema**

```typescript
// src/sanity/schemaTypes/sections/statsCounterSection.ts
import { defineField, defineType, defineArrayMember } from 'sanity';
import { BarChartIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { statItemType } from '../objects/statItem';

export const statsCounterSectionType = defineType({
  name: 'statsCounterSection',
  title: 'Stats Counter Section',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนสถิติ (ไม่จำเป็น)',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      description: 'รายการตัวเลขสถิติ (แนะนำ 3-4 รายการ)',
      type: 'array',
      of: [defineArrayMember({ type: statItemType.name })],
      validation: (Rule) => Rule.min(2).max(6),
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
    select: { title: 'heading.heading.0.value', stats: 'stats' },
    prepare({ title, stats }) {
      const count = Array.isArray(stats) ? stats.length : 0;
      return {
        title: title || 'Stats Counter Section',
        subtitle: `${count} stat${count === 1 ? '' : 's'}`,
      };
    },
  },
});
```

- [ ] **Step 2: Create teamSection schema**

```typescript
// src/sanity/schemaTypes/sections/teamSection.ts
import { defineField, defineType, defineArrayMember } from 'sanity';
import { UsersIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { teamMemberType } from '../objects/teamMember';

export const teamSectionType = defineType({
  name: 'teamSection',
  title: 'Team Section',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนทีมงาน',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'members',
      title: 'Team Members',
      description: 'รายชื่อสมาชิกทีม',
      type: 'array',
      of: [defineArrayMember({ type: teamMemberType.name })],
      validation: (Rule) => Rule.min(1),
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
    select: { title: 'heading.heading.0.value', members: 'members' },
    prepare({ title, members }) {
      const count = Array.isArray(members) ? members.length : 0;
      return {
        title: title || 'Team Section',
        subtitle: `${count} member${count === 1 ? '' : 's'}`,
      };
    },
  },
});
```

- [ ] **Step 3: Create faqSection schema**

```typescript
// src/sanity/schemaTypes/sections/faqSection.ts
import { defineField, defineType, defineArrayMember } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { faqItemType } from '../objects/faqItem';

export const faqSectionType = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนคำถามที่พบบ่อย',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'items',
      title: 'FAQ Items',
      description: 'รายการคำถาม-คำตอบ',
      type: 'array',
      of: [defineArrayMember({ type: faqItemType.name })],
      validation: (Rule) => Rule.min(1),
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
    select: { title: 'heading.heading.0.value', items: 'items' },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: title || 'FAQ Section',
        subtitle: `${count} question${count === 1 ? '' : 's'}`,
      };
    },
  },
});
```

- [ ] **Step 4: Create videoShowreelSection schema**

```typescript
// src/sanity/schemaTypes/sections/videoShowreelSection.ts
import { defineField, defineType } from 'sanity';
import { PlayIcon } from '@sanity/icons';
import { localizedBlockType, localizedStringField } from '../objects/localized';
import {
  ImageAssetValue,
  SanityValidationContext,
  validateImageAssetSizeWarning,
} from '../objects/backgroundMedia';

export const videoShowreelSectionType = defineType({
  name: 'videoShowreelSection',
  title: 'Video Showreel Section',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนวิดีโอ (ไม่จำเป็น)',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'ลิงก์วิดีโอจาก YouTube หรือ Vimeo',
      type: 'url',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      description:
        'รูปภาพปกวิดีโอ (แนะนำอัตราส่วน 16:9, ขนาดไม่เกิน 1MB)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.required().custom((value, context) =>
          validateImageAssetSizeWarning(
            value as ImageAssetValue | undefined,
            context as SanityValidationContext
          )
        ).warning(),
    }),
    localizedStringField({
      name: 'caption',
      title: 'Caption',
      description: 'คำอธิบายวิดีโอสั้นๆ (ไม่จำเป็น)',
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
    select: { title: 'heading.heading.0.value', url: 'videoUrl' },
    prepare({ title, url }) {
      return {
        title: title || 'Video Showreel',
        subtitle: url || 'No URL set',
      };
    },
  },
});
```

- [ ] **Step 5: Register all 4 section schemas in index + add to page schema arrays**

In `src/sanity/schemaTypes/index.ts`: import and add the 4 section types to the `schemaTypes` array.

In `src/sanity/schemaTypes/page.ts`: add `{ type: 'statsCounterSection' }`, `{ type: 'teamSection' }`, `{ type: 'faqSection' }`, `{ type: 'videoShowreelSection' }` to **both** `commercialSections` and `weddingSections` array `of` definitions.

- [ ] **Step 6: Deploy schema to Sanity**

```bash
pnpm sanity schema extract
```

Verify in Sanity Studio that new section types appear in the page builder insert menu.

- [ ] **Step 7: Commit**

```bash
git add src/sanity/schemaTypes/
git commit -m "feat(sanity): add statsCounter, team, faq, videoShowreel section schemas"
```

---

## Task 4: GROQ Query Fragments

**Files:**
- Modify: `src/sanity/lib/queries/sections.ts`
- Modify: `src/sanity/lib/queries.ts`

- [ ] **Step 1: Add 4 GROQ section fragments to sections.ts**

Add these fragments after the existing section exports in `src/sanity/lib/queries/sections.ts`:

```typescript
export const STATS_COUNTER_SECTION = groq`
  _type == "statsCounterSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    stats[] {
      _key,
      value,
      suffix,
      "label": ${LOCALIZED('label')}
    }
  }
`;

export const TEAM_SECTION = groq`
  _type == "teamSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    members[] {
      _key,
      name,
      "role": ${LOCALIZED('role')},
      "bio": ${LOCALIZED('bio')},
      image {
        asset,
        crop,
        hotspot
      }
    }
  }
`;

export const FAQ_SECTION = groq`
  _type == "faqSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    items[] {
      _key,
      "question": ${LOCALIZED('question')},
      "answer": ${LOCALIZED('answer')}
    }
  }
`;

export const VIDEO_SHOWREEL_SECTION = groq`
  _type == "videoShowreelSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    videoUrl,
    thumbnail {
      asset,
      crop,
      hotspot
    },
    "caption": ${LOCALIZED('caption')}
  }
`;
```

- [ ] **Step 2: Add fragments to page query contentBlocks projection**

In `src/sanity/lib/queries.ts`, inside the `pageBySlugQuery` contentBlocks projection, add:

```groq
${STATS_COUNTER_SECTION},
${TEAM_SECTION},
${FAQ_SECTION},
${VIDEO_SHOWREEL_SECTION},
```

Import the 4 new constants at the top of the file from `./queries/sections`.

- [ ] **Step 3: Type-check**

```bash
pnpm run type-check
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/sanity/lib/queries/sections.ts src/sanity/lib/queries.ts
git commit -m "feat(sanity): add GROQ fragments for 4 new section types"
```

---

## Task 5: Frontend Types

**Files:**
- Create: `src/features/stats-counter-section/types/statsCounterBlock.types.ts`
- Create: `src/features/stats-counter-section/types/index.ts`
- Create: `src/features/team-section/types/teamBlock.types.ts`
- Create: `src/features/team-section/types/index.ts`
- Create: `src/features/faq-section/types/faqBlock.types.ts`
- Create: `src/features/faq-section/types/index.ts`
- Create: `src/features/video-showreel-section/types/videoShowreelBlock.types.ts`
- Create: `src/features/video-showreel-section/types/index.ts`

- [ ] **Step 1: Create all type files**

```typescript
// src/features/stats-counter-section/types/statsCounterBlock.types.ts
import { BaseBlock, SectionHeading } from '@shared/types';

export interface StatsCounterSectionBlock extends BaseBlock {
  _type: 'statsCounterSection';
  background?: string;
  heading?: SectionHeading;
  stats?: Array<{
    _key?: string;
    value?: string;
    suffix?: string;
    label?: string;
  }>;
}
```

```typescript
// src/features/team-section/types/teamBlock.types.ts
import { BaseBlock, SectionHeading } from '@shared/types';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface TeamSectionBlock extends BaseBlock {
  _type: 'teamSection';
  background?: string;
  heading?: SectionHeading;
  members?: Array<{
    _key?: string;
    name?: string;
    role?: string;
    bio?: string;
    image?: SanityImageSource;
  }>;
}
```

```typescript
// src/features/faq-section/types/faqBlock.types.ts
import { BaseBlock, SectionHeading } from '@shared/types';

export interface FAQSectionBlock extends BaseBlock {
  _type: 'faqSection';
  background?: string;
  heading?: SectionHeading;
  items?: Array<{
    _key?: string;
    question?: string;
    answer?: string;
  }>;
}
```

```typescript
// src/features/video-showreel-section/types/videoShowreelBlock.types.ts
import { BaseBlock, SectionHeading } from '@shared/types';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface VideoShowreelSectionBlock extends BaseBlock {
  _type: 'videoShowreelSection';
  background?: string;
  heading?: SectionHeading;
  videoUrl?: string;
  thumbnail?: SanityImageSource;
  caption?: string;
}
```

Each `types/index.ts` is `export * from './{name}Block.types';`.

- [ ] **Step 2: Commit**

```bash
git add src/features/stats-counter-section/types/ src/features/team-section/types/ src/features/faq-section/types/ src/features/video-showreel-section/types/
git commit -m "feat(types): add type definitions for 4 new section blocks"
```

---

## Task 6: Frontend Components — StatsCounterSection

**Files:**
- Create: `src/features/stats-counter-section/components/StatsCounterSection.tsx`
- Create: `src/features/stats-counter-section/components/index.ts`
- Create: `src/features/stats-counter-section/index.ts`

- [ ] **Step 1: Create component**

```typescript
// src/features/stats-counter-section/components/StatsCounterSection.tsx
'use client';

import { m, type Variants } from 'motion/react';
import { SectionShell, SectionHeader } from '@shared/components';
import { useDeviceTier } from '@shared/hooks';
import { StatsCounterSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

interface StatsCounterSectionProps {
  block: StatsCounterSectionBlock;
}

export default function StatsCounterSection({ block }: StatsCounterSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <SectionShell background={block.background} dataTestId="stats-counter-section">
      <div className="container mx-auto">
        {block.heading && (
          <SectionHeader heading={block.heading} className="mx-auto mb-12 max-w-3xl text-center" />
        )}
        {block.stats?.length ? (
          <m.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={useLiteMotion ? undefined : containerVariants}
          >
            {block.stats.map((stat, index) => (
              <m.div
                key={stat._key ?? index}
                className="flex flex-col items-center text-center"
                variants={useLiteMotion ? undefined : itemVariants}
                data-testid="stat-item"
              >
                <span className="text-primary text-4xl font-black md:text-5xl lg:text-6xl">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-primary/70">{stat.suffix}</span>
                  )}
                </span>
                <span className="text-muted-foreground mt-2 text-sm font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
              </m.div>
            ))}
          </m.div>
        ) : null}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 2: Create barrel exports**

```typescript
// src/features/stats-counter-section/components/index.ts
export { default as StatsCounterSection } from './StatsCounterSection';

// src/features/stats-counter-section/index.ts
export { StatsCounterSection } from './components';
export type { StatsCounterSectionBlock } from './types';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/stats-counter-section/
git commit -m "feat(ui): add StatsCounterSection component"
```

---

## Task 7: Frontend Components — TeamSection

**Files:**
- Create: `src/features/team-section/components/TeamSection.tsx`
- Create: `src/features/team-section/components/index.ts`
- Create: `src/features/team-section/index.ts`

- [ ] **Step 1: Create component**

Uses shadcn `Avatar` for consistent circular team member photos.

```typescript
// src/features/team-section/components/TeamSection.tsx
'use client';

import { m, type Variants } from 'motion/react';
import Image from 'next/image';
import { SectionShell, SectionHeader } from '@shared/components';
import { useDeviceTier } from '@shared/hooks';
import { urlFor } from '@/sanity/lib/image';
import { TeamSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface TeamSectionProps {
  block: TeamSectionBlock;
}

export default function TeamSection({ block }: TeamSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <SectionShell background={block.background} dataTestId="team-section">
      <div className="container mx-auto">
        {block.heading && (
          <SectionHeader heading={block.heading} className="mx-auto mb-14 max-w-3xl text-center" />
        )}
        {block.members?.length ? (
          <m.div
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 md:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={useLiteMotion ? undefined : containerVariants}
          >
            {block.members.map((member, index) => (
              <m.article
                key={member._key ?? index}
                className="flex flex-col items-center text-center"
                variants={useLiteMotion ? undefined : itemVariants}
                data-testid="team-member"
              >
                {member.image && (
                  <div className="bg-muted relative mb-4 size-28 overflow-hidden rounded-full md:size-32">
                    <Image
                      src={urlFor(member.image).width(256).height(256).fit('crop').url()}
                      alt={member.name ?? 'Team member'}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 128px, 112px"
                    />
                  </div>
                )}
                <h3 className="text-foreground text-base font-semibold">{member.name}</h3>
                {member.role && (
                  <p className="text-muted-foreground mt-1 text-sm">{member.role}</p>
                )}
                {member.bio && (
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{member.bio}</p>
                )}
              </m.article>
            ))}
          </m.div>
        ) : null}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 2: Create barrel exports** (same pattern as Task 6)

- [ ] **Step 3: Commit**

```bash
git add src/features/team-section/
git commit -m "feat(ui): add TeamSection component"
```

---

## Task 8: Frontend Components — FAQSection

**Files:**
- Create: `src/features/faq-section/components/FAQSection.tsx`
- Create: `src/features/faq-section/components/index.ts`
- Create: `src/features/faq-section/index.ts`

- [ ] **Step 1: Create component**

Uses shadcn `Accordion` for accessible expand/collapse.

```typescript
// src/features/faq-section/components/FAQSection.tsx
import { SectionShell, SectionHeader } from '@shared/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQSectionBlock } from '../types';

interface FAQSectionProps {
  block: FAQSectionBlock;
}

export default function FAQSection({ block }: FAQSectionProps) {
  return (
    <SectionShell background={block.background} dataTestId="faq-section">
      <div className="container mx-auto max-w-3xl">
        {block.heading && (
          <SectionHeader heading={block.heading} className="mx-auto mb-12 max-w-2xl text-center" />
        )}
        {block.items?.length ? (
          <Accordion type="single" collapsible className="w-full">
            {block.items.map((item, index) => (
              <AccordionItem
                key={item._key ?? index}
                value={item._key ?? `faq-${index}`}
                data-testid="faq-item"
              >
                <AccordionTrigger className="text-foreground text-left text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : null}
      </div>
    </SectionShell>
  );
}
```

Note: No `'use client'` needed — shadcn Accordion handles its own client boundary. No motion needed — Accordion has built-in open/close animation.

- [ ] **Step 2: Create barrel exports** (same pattern)

- [ ] **Step 3: Commit**

```bash
git add src/features/faq-section/
git commit -m "feat(ui): add FAQSection component with shadcn Accordion"
```

---

## Task 9: Frontend Components — VideoShowreelSection

**Files:**
- Create: `src/features/video-showreel-section/components/VideoShowreelSection.tsx`
- Create: `src/features/video-showreel-section/components/index.ts`
- Create: `src/features/video-showreel-section/index.ts`

- [ ] **Step 1: Create component**

Renders a 16:9 video embed with thumbnail poster and play button overlay. Uses `AspectRatio` from shadcn.

```typescript
// src/features/video-showreel-section/components/VideoShowreelSection.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SectionShell, SectionHeader } from '@shared/components';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { urlFor } from '@/sanity/lib/image';
import { VideoShowreelSectionBlock } from '../types';

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // YouTube
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      const videoId =
        parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop();
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }
    // Vimeo
    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : null;
    }
  } catch {
    return null;
  }
  return null;
}

interface VideoShowreelSectionProps {
  block: VideoShowreelSectionBlock;
}

export default function VideoShowreelSection({ block }: VideoShowreelSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = block.videoUrl ? getEmbedUrl(block.videoUrl) : null;

  return (
    <SectionShell background={block.background} dataTestId="video-showreel-section">
      <div className="container mx-auto max-w-5xl">
        {block.heading && (
          <SectionHeader heading={block.heading} className="mx-auto mb-10 max-w-3xl text-center" />
        )}
        <div className="overflow-hidden rounded-lg">
          <AspectRatio ratio={16 / 9}>
            {isPlaying && embedUrl ? (
              <iframe
                src={embedUrl}
                title={block.caption ?? 'Video showreel'}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group relative size-full cursor-pointer"
                aria-label="Play video"
                data-testid="showreel-play"
              >
                {block.thumbnail && (
                  <Image
                    src={urlFor(block.thumbnail).width(1280).height(720).fit('crop').url()}
                    alt={block.caption ?? 'Video thumbnail'}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(min-width: 1024px) 1024px, 100vw"
                  />
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-300 group-hover:bg-black/20">
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:size-20">
                    <svg viewBox="0 0 24 24" fill="white" className="ml-1 size-6 md:size-8">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </AspectRatio>
        </div>
        {block.caption && (
          <p className="text-muted-foreground mt-4 text-center text-sm">{block.caption}</p>
        )}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 2: Create barrel exports** (same pattern)

- [ ] **Step 3: Commit**

```bash
git add src/features/video-showreel-section/
git commit -m "feat(ui): add VideoShowreelSection component with YouTube/Vimeo embed"
```

---

## Task 10: PageBuilder Integration

**Files:**
- Modify: `src/features/PageBuilder.tsx`

- [ ] **Step 1: Add dynamic imports and switch cases**

Read the current `PageBuilder.tsx`. Add these imports at the top alongside existing dynamic imports:

```typescript
const StatsCounterSection = dynamic(
  () => import('@features/stats-counter-section/components/StatsCounterSection')
);
const TeamSection = dynamic(
  () => import('@features/team-section/components/TeamSection')
);
const FAQSection = dynamic(
  () => import('@features/faq-section/components/FAQSection')
);
const VideoShowreelSection = dynamic(
  () => import('@features/video-showreel-section/components/VideoShowreelSection')
);
```

Add the block types to the `PageContentBlock` union type:

```typescript
import type { StatsCounterSectionBlock } from '@features/stats-counter-section';
import type { TeamSectionBlock } from '@features/team-section';
import type { FAQSectionBlock } from '@features/faq-section';
import type { VideoShowreelSectionBlock } from '@features/video-showreel-section';
```

Add 4 new cases in the switch statement:

```typescript
case 'statsCounterSection':
  return <StatsCounterSection key={key} block={block as StatsCounterSectionBlock} />;
case 'teamSection':
  return <TeamSection key={key} block={block as TeamSectionBlock} />;
case 'faqSection':
  return <FAQSection key={key} block={block as FAQSectionBlock} />;
case 'videoShowreelSection':
  return <VideoShowreelSection key={key} block={block as VideoShowreelSectionBlock} />;
```

- [ ] **Step 2: Type-check and verify**

```bash
pnpm run type-check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/PageBuilder.tsx
git commit -m "feat(pagebuilder): register 4 new section types in PageBuilder routing"
```

---

## Task 11: Verify End-to-End

- [ ] **Step 1: Run full type-check**

```bash
pnpm run type-check
```

- [ ] **Step 2: Run linter**

```bash
pnpm run lint
```

- [ ] **Step 3: Start dev server and verify Sanity Studio**

```bash
pnpm dev
```

Open Sanity Studio, edit any page, and verify the 4 new section types appear in the section insert menu. Try adding one of each.

- [ ] **Step 4: Run existing tests**

```bash
pnpm test
```

Expected: all existing tests still pass.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify new sections integration"
```
