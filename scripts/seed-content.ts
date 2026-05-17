/**
 * Seed script for 56KonFilm Sanity CMS
 *
 * Downloads stock images from Unsplash, uploads to Sanity, and populates all
 * pages, projects, posts, and settings with bilingual (EN/TH) mock content.
 *
 * Usage:
 *   npx tsx scripts/seed-content.ts           # normal run
 *   npx tsx scripts/seed-content.ts --force    # overwrite existing content
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from 'next-sanity';

dotenv.config({ path: '.env.local' });

// ============================================================
// 1. SETUP & CONFIGURATION
// ============================================================

const FORCE = process.argv.includes('--force');
const TEMP_DIR = '/tmp/56konfilm-seed';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-12';
const token = process.env.SANITY_API_TOKEN;

if (!token || !projectId || !dataset) {
  console.error(
    '❌ Missing required env vars: SANITY_API_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET'
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// ============================================================
// 2. HELPER FUNCTIONS
// ============================================================

let keyCounter = 0;
function k(): string {
  keyCounter++;
  return `seed${keyCounter.toString(36).padStart(8, '0')}${Date.now().toString(36).slice(-4)}`;
}

function i18nStr(en: string, th?: string) {
  const items: Record<string, unknown>[] = [
    {
      _key: k(),
      _type: 'internationalizedArrayStringValue',
      language: 'en',
      value: en,
    },
  ];
  if (th)
    items.push({
      _key: k(),
      _type: 'internationalizedArrayStringValue',
      language: 'th',
      value: th,
    });
  return items;
}

function i18nTxt(en: string, th?: string) {
  const items: Record<string, unknown>[] = [
    {
      _key: k(),
      _type: 'internationalizedArrayTextValue',
      language: 'en',
      value: en,
    },
  ];
  if (th)
    items.push({
      _key: k(),
      _type: 'internationalizedArrayTextValue',
      language: 'th',
      value: th,
    });
  return items;
}

function imgRef(assetId: string) {
  return { _type: 'image', asset: { _ref: assetId, _type: 'reference' } };
}

function bgMedia(assetId: string) {
  return {
    _type: 'backgroundMedia',
    mediaAsset: [
      {
        _key: k(),
        _type: 'backgroundImage',
        asset: { _ref: assetId, _type: 'reference' },
      },
    ],
  };
}

function mediaBlock(assetId: string, altEn: string, altTh?: string) {
  return {
    _type: 'mediaBlock',
    image: imgRef(assetId),
    alt: i18nStr(altEn, altTh),
  };
}

function localBlock(
  eyebrowEn: string,
  eyebrowTh: string,
  headingEn: string,
  headingTh: string,
  bodyEn?: string,
  bodyTh?: string,
  align: string = 'start'
) {
  return {
    _type: 'localizedBlock',
    eyebrow: i18nStr(eyebrowEn, eyebrowTh),
    heading: i18nStr(headingEn, headingTh),
    ...(bodyEn ? { body: i18nTxt(bodyEn, bodyTh) } : {}),
    align,
  };
}

function cta(
  labelEn: string,
  labelTh: string,
  style: string,
  pageRefId?: string,
  externalUrl?: string
) {
  const obj: Record<string, unknown> = {
    _key: k(),
    _type: 'cta',
    label: i18nStr(labelEn, labelTh),
    style,
    linkType: pageRefId ? 'internal' : 'external',
  };
  if (pageRefId) obj.pageRef = { _ref: pageRefId, _type: 'reference' };
  if (externalUrl) obj.externalUrl = externalUrl;
  return obj;
}

function portableText(paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: 'block',
    _key: k(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: k(), text, marks: [] }],
  }));
}

// ============================================================
// 3. IMAGE MANIFEST
// ============================================================

type ImageEntry = { name: string; photoId: string; w: number; h: number };

const IMAGES: ImageEntry[] = [
  // Production heroes
  {
    name: 'prod_hero_1',
    photoId: '1485846234645-a62644f84728',
    w: 1920,
    h: 1080,
  },
  {
    name: 'prod_hero_2',
    photoId: '1524712245354-2c4e5e7121c0',
    w: 1920,
    h: 1080,
  },
  {
    name: 'prod_hero_3',
    photoId: '1478720568477-152d9b164e26',
    w: 1920,
    h: 1080,
  },
  // Wedding heroes
  {
    name: 'wed_hero_1',
    photoId: '1519741497674-611481863552',
    w: 1920,
    h: 1080,
  },
  {
    name: 'wed_hero_2',
    photoId: '1465495976277-4387d4b0b4c6',
    w: 1920,
    h: 1080,
  },
  {
    name: 'wed_hero_3',
    photoId: '1511285560929-80b456fea0bc',
    w: 1920,
    h: 1080,
  },
  // Two-column production
  { name: 'prod_col_1', photoId: '1492691527719-9d1e07e534b4', w: 800, h: 600 },
  { name: 'prod_col_2', photoId: '1598899134739-24c46f58b8c0', w: 800, h: 600 },
  { name: 'prod_col_3', photoId: '1535016120703-61d59fee2674', w: 800, h: 600 },
  // Two-column wedding
  { name: 'wed_col_1', photoId: '1522673607200-164d1b6ce486', w: 800, h: 600 },
  { name: 'wed_col_2', photoId: '1507003211169-0a1dd7228f2d', w: 800, h: 600 },
  // Portfolio covers — production
  { name: 'proj_prod_1', photoId: '1551817958-d1d8a5e85f5f', w: 1200, h: 800 },
  {
    name: 'proj_prod_2',
    photoId: '1493225457124-a3eb161ffa5f',
    w: 1200,
    h: 800,
  },
  {
    name: 'proj_prod_3',
    photoId: '1536440136628-849c177e76a1',
    w: 1200,
    h: 800,
  },
  {
    name: 'proj_prod_4',
    photoId: '1505236858219-8359eb29e329',
    w: 1200,
    h: 800,
  },
  {
    name: 'proj_prod_5',
    photoId: '1504674900247-0877df9cc836',
    w: 1200,
    h: 800,
  },
  // Portfolio covers — wedding
  { name: 'proj_wed_1', photoId: '1544078751-58fee2d8a03b', w: 1200, h: 800 },
  {
    name: 'proj_wed_2',
    photoId: '1519225421980-715cb0215aed',
    w: 1200,
    h: 800,
  },
  {
    name: 'proj_wed_3',
    photoId: '1591604466107-ec97de577aff',
    w: 1200,
    h: 800,
  },
  {
    name: 'proj_wed_4',
    photoId: '1460978812857-470ed1c77af0',
    w: 1200,
    h: 800,
  },
  // Gallery extras (production home)
  { name: 'gallery_1', photoId: '1473968512647-3e447244af8f', w: 1200, h: 900 },
  { name: 'gallery_2', photoId: '1574717024653-61fd2cf4d44d', w: 1200, h: 900 },
  { name: 'gallery_3', photoId: '1489599849927-2ee91cede3ba', w: 1200, h: 900 },
  // CTA banners
  { name: 'cta_prod', photoId: '1518998053901-5348d3961a04', w: 1920, h: 512 },
  { name: 'cta_wed', photoId: '1606216794074-735e91aa2c92', w: 1920, h: 512 },
  // Testimonial avatars
  { name: 'avatar_1', photoId: '1507003211169-0a1dd7228f2d', w: 200, h: 200 },
  { name: 'avatar_2', photoId: '1494790108377-be9c29b29330', w: 200, h: 200 },
  { name: 'avatar_3', photoId: '1472099645785-5658abf4ff4e', w: 200, h: 200 },
  { name: 'avatar_4', photoId: '1438761681033-6461ffad8d80', w: 200, h: 200 },
  // Blog images
  { name: 'blog_1', photoId: '1516035069371-29a1b244cc32', w: 1200, h: 630 },
  { name: 'blog_2', photoId: '1542621334-a254cf47733d', w: 1200, h: 630 },
  { name: 'blog_3', photoId: '1529636798458-92182e662485', w: 1200, h: 630 },
  { name: 'blog_4', photoId: '1574717024653-61fd2cf4d44d', w: 1200, h: 630 },
];

// ============================================================
// 4. PAGE DOCUMENT IDS (from existing CMS data)
// ============================================================

const PAGE_IDS = {
  prod_home: '3a3892bb-e26b-42b0-80fc-4d34359e7ee3',
  prod_about: '4c9475fb-85f0-46bb-8b19-de3fcf9625de',
  prod_services: '3edd26d1-3150-4b4f-aa55-74ac4273e4b6',
  prod_portfolio: '7d9c8310-bafe-4ac5-8f4c-19b5f5d98009',
  prod_contact: '445bf9f6-af13-4ed6-a806-ef22f72bad60',
  wed_home: '56ab1c2a-b83a-47fe-a00f-207d3bdd07f6',
  wed_about: 'f0814801-fae9-4311-b53f-7b13da7ccf86',
  wed_services: 'd0b48618-614f-46eb-8132-c95ad7a3e184',
  wed_portfolio: 'ad627b47-b421-40ea-a57b-25539d54f7aa',
  wed_packages: 'b4a941b4-eac9-473f-b64f-c488117dec1a',
  wed_contact: '66cdf26b-c0ec-4e9a-b1f1-6c24f960518a',
} as const;

// ============================================================
// 5. DOWNLOAD & UPLOAD IMAGES
// ============================================================

async function downloadImage(entry: ImageEntry): Promise<string | null> {
  const url = `https://images.unsplash.com/photo-${entry.photoId}?w=${entry.w}&h=${entry.h}&q=80&auto=format&fit=crop`;
  const dest = path.join(TEMP_DIR, `${entry.name}.jpg`);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': '56konfilm-seed-script/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return dest;
  } catch (err) {
    console.warn(`  ⚠ Failed to download ${entry.name}: ${err}`);
    return null;
  }
}

async function uploadImage(
  filePath: string,
  filename: string
): Promise<string> {
  const file = fs.createReadStream(filePath);
  const asset = await client.assets.upload('image', file, { filename });
  return asset._id;
}

async function downloadAndUploadAll(): Promise<Map<string, string>> {
  const assets = new Map<string, string>();
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  console.log(`\n📸 Downloading & uploading ${IMAGES.length} images...`);

  for (let i = 0; i < IMAGES.length; i++) {
    const entry = IMAGES[i];
    process.stdout.write(`  [${i + 1}/${IMAGES.length}] ${entry.name}...`);

    const filePath = await downloadImage(entry);
    if (!filePath) {
      console.log(' skipped');
      continue;
    }

    try {
      const assetId = await uploadImage(filePath, `${entry.name}.jpg`);
      assets.set(entry.name, assetId);
      console.log(` ✓ ${assetId}`);
    } catch (err) {
      console.log(` ✗ upload failed: ${err}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  // Cleanup temp files
  try {
    fs.rmSync(TEMP_DIR, { recursive: true });
  } catch {
    /* ignore */
  }

  console.log(
    `  📦 ${assets.size}/${IMAGES.length} images uploaded successfully`
  );
  return assets;
}

// Helper: get asset or return null
function a(assets: Map<string, string>, name: string): string | null {
  return assets.get(name) ?? null;
}

// ============================================================
// 6. CREATE PROJECTS
// ============================================================

function buildProductionProjects(assets: Map<string, string>) {
  const projects = [
    {
      title: i18nStr('The Horizon Campaign', 'แคมเปญ The Horizon'),
      slug: { _type: 'slug', current: 'the-horizon-campaign' },
      client: 'Siam Cement Group',
      year: '2024',
      services: ['Corporate Video', 'Aerial Cinematography', 'Color Grading'],
      overview: i18nTxt(
        'A sweeping corporate campaign for SCG that showcased their vision for sustainable infrastructure. Shot across multiple locations in Thailand with aerial drone sequences.',
        'แคมเปญองค์กรสำหรับ SCG ที่นำเสนอวิสัยทัศน์ด้านโครงสร้างพื้นฐานที่ยั่งยืน ถ่ายทำหลายสถานที่ทั่วประเทศไทยพร้อมภาพมุมสูงจากโดรน'
      ),
      coverImg: 'proj_prod_1',
      galleryImgs: ['prod_hero_1', 'gallery_1', 'prod_col_1'],
      publishedAt: '2024-06-15T00:00:00Z',
    },
    {
      title: i18nStr('Echoes of Flavor', 'เสียงสะท้อนแห่งรสชาติ'),
      slug: { _type: 'slug', current: 'echoes-of-flavor' },
      client: 'Bangkok Food Festival',
      year: '2024',
      services: ['Food Commercial', 'Directing', 'Sound Design'],
      overview: i18nTxt(
        "A sensory-driven commercial celebrating Bangkok's culinary heritage. Every frame was crafted to make viewers taste the story.",
        'โฆษณาที่กระตุ้นประสาทสัมผัสเพื่อเฉลิมฉลองมรดกทางอาหารของกรุงเทพฯ ทุกเฟรมถูกสร้างสรรค์ให้ผู้ชมสัมผัสได้ถึงเรื่องราว'
      ),
      coverImg: 'proj_prod_5',
      galleryImgs: ['prod_hero_2', 'gallery_2', 'prod_col_2'],
      publishedAt: '2024-03-10T00:00:00Z',
    },
    {
      title: i18nStr('Moving Forward', 'ก้าวไปข้างหน้า'),
      slug: { _type: 'slug', current: 'moving-forward' },
      client: 'Thai Health Foundation',
      year: '2023',
      services: ['Documentary', 'Interview', 'Post-Production'],
      overview: i18nTxt(
        'A powerful documentary following three Thai communities rebuilding after the pandemic. Raw, honest, and deeply human.',
        'สารคดีทรงพลังที่ติดตาม 3 ชุมชนในประเทศไทยที่กำลังฟื้นตัวหลังการระบาด จริง ตรงไปตรงมา และเต็มไปด้วยความเป็นมนุษย์'
      ),
      coverImg: 'proj_prod_3',
      galleryImgs: ['prod_hero_3', 'gallery_3', 'prod_col_3'],
      publishedAt: '2023-11-20T00:00:00Z',
    },
    {
      title: i18nStr('Neon Pulse', 'จังหวะนีออน'),
      slug: { _type: 'slug', current: 'neon-pulse' },
      client: 'Universal Music Thailand',
      year: '2023',
      services: ['Music Video', 'Cinematography', 'VFX'],
      overview: i18nTxt(
        'An electrifying music video blending neon-lit cityscapes with dynamic choreography. Featured on MTV Asia.',
        'มิวสิควิดีโอที่เต็มไปด้วยพลัง ผสมผสานทิวทัศน์เมืองสีนีออนกับท่าเต้นแบบไดนามิก ได้ออนแอร์ทาง MTV Asia'
      ),
      coverImg: 'proj_prod_4',
      galleryImgs: ['prod_hero_1', 'gallery_1', 'prod_col_1'],
      publishedAt: '2023-08-05T00:00:00Z',
    },
    {
      title: i18nStr('Crafted with Care', 'สร้างสรรค์ด้วยใจ'),
      slug: { _type: 'slug', current: 'crafted-with-care' },
      client: 'Elephant Pottery Studio',
      year: '2025',
      services: ['Brand Film', 'Product Showcase', 'Drone'],
      overview: i18nTxt(
        'An intimate brand film for a Thai artisan pottery studio. We captured the meditative process of handmade ceramics from clay to kiln.',
        'แบรนด์ฟิล์มสำหรับสตูดิโอเครื่องปั้นดินเผาของช่างฝีมือไทย เราบันทึกกระบวนการทำเซรามิกด้วยมือตั้งแต่ดินจนถึงเตาเผา'
      ),
      coverImg: 'proj_prod_2',
      galleryImgs: ['prod_hero_2', 'gallery_2', 'prod_col_2'],
      publishedAt: '2025-01-20T00:00:00Z',
    },
  ];

  return projects.map((p) => {
    const coverId = a(assets, p.coverImg);
    const galleryAssets = p.galleryImgs
      .map((n) => a(assets, n))
      .filter(Boolean) as string[];
    return {
      _type: 'project' as const,
      title: p.title,
      slug: p.slug,
      siteMode: 'production',
      client: p.client,
      year: p.year,
      services: p.services,
      overview: p.overview,
      ...(coverId ? { coverImage: imgRef(coverId) } : {}),
      contentBlocks: [
        {
          _key: k(),
          _type: 'heroSection',
          title: p.title,
          tagline: i18nStr(
            `${p.client} · ${p.year}`,
            `${p.client} · ${p.year}`
          ),
          ...(coverId ? { backgroundMedia: bgMedia(coverId) } : {}),
        },
        {
          _key: k(),
          _type: 'mediaGallerySection',
          heading: localBlock(
            'GALLERY',
            'แกลเลอรี',
            'Project Gallery',
            'แกลเลอรีโปรเจกต์'
          ),
          sourceType: 'manual',
          items: galleryAssets.map((aid) => ({
            _key: k(),
            _type: 'galleryItem',
            mediaType: 'image',
            media: mediaBlock(aid, 'Project photo', 'ภาพจากโปรเจกต์'),
          })),
          background: 'default',
        },
      ],
      publishedAt: p.publishedAt,
      seo: {
        _type: 'seo',
        title: p.title,
        description: p.overview,
      },
    };
  });
}

function buildWeddingProjects(assets: Map<string, string>) {
  const projects = [
    {
      title: i18nStr('A Love That Blooms', 'รักที่ผลิบาน'),
      slug: { _type: 'slug', current: 'a-love-that-blooms' },
      client: 'Natcha & Prem',
      year: '2024',
      services: ['Wedding Cinematography', 'Same-Day Edit'],
      overview: i18nTxt(
        'A garden wedding at Jim Thompson Farm, Nakhon Ratchasima. Soft golden light, flowing fabrics, and genuine tears of joy.',
        'งานแต่งในสวนที่จิม ทอมป์สัน ฟาร์ม นครราชสีมา แสงทองอ่อนโยน ผ้าปลิวไสว และน้ำตาแห่งความสุข'
      ),
      coverImg: 'proj_wed_1',
      galleryImgs: ['wed_hero_1', 'wed_col_1', 'proj_wed_2'],
      publishedAt: '2024-04-12T00:00:00Z',
    },
    {
      title: i18nStr('Sunset Vows', 'คำสัญญายามอาทิตย์ลับขอบฟ้า'),
      slug: { _type: 'slug', current: 'sunset-vows' },
      client: 'Sarah & James',
      year: '2024',
      services: ['Destination Wedding', 'Aerial Drone'],
      overview: i18nTxt(
        'A breathtaking beach ceremony in Krabi with drone aerial shots capturing the Andaman sea. A true destination wedding masterpiece.',
        'พิธีริมชายหาดสุดประทับใจที่กระบี่ พร้อมภาพมุมสูงจากโดรนที่จับภาพทะเลอันดามัน งานแต่งสุดพิเศษอย่างแท้จริง'
      ),
      coverImg: 'proj_wed_3',
      galleryImgs: ['wed_hero_2', 'wed_col_2', 'proj_wed_4'],
      publishedAt: '2024-09-28T00:00:00Z',
    },
    {
      title: i18nStr('The Grand Celebration', 'เฉลิมฉลองแห่งรัก'),
      slug: { _type: 'slug', current: 'the-grand-celebration' },
      client: 'Mook & Tong',
      year: '2023',
      services: ['Full-Day Coverage', 'Live Streaming'],
      overview: i18nTxt(
        'A lavish Thai-Chinese wedding spanning two full days of celebration. Morning tea ceremony, afternoon procession, and evening banquet.',
        'งานแต่งไทย-จีนอลังการยาวสองวันเต็ม พิธีชงชาเช้า ขบวนแห่ตอนบ่าย และงานเลี้ยงค่ำ'
      ),
      coverImg: 'proj_wed_2',
      galleryImgs: ['wed_hero_3', 'wed_col_1', 'proj_wed_1'],
      publishedAt: '2023-12-15T00:00:00Z',
    },
    {
      title: i18nStr('Whispers of Forever', 'กระซิบรักนิรันดร์'),
      slug: { _type: 'slug', current: 'whispers-of-forever' },
      client: 'Ploy & Mark',
      year: '2025',
      services: ['Pre-Wedding Film', 'Highlight Film'],
      overview: i18nTxt(
        "An intimate pre-wedding shoot in Chiang Mai's old city. Lantern-lit alleyways, ancient temples, and quiet moments of connection.",
        'พรีเวดดิ้งสุดอบอุ่นในเมืองเก่าเชียงใหม่ ซอยสว่างด้วยโคมไฟ วัดโบราณ และช่วงเวลาเงียบสงบของสองคน'
      ),
      coverImg: 'proj_wed_4',
      galleryImgs: ['wed_hero_1', 'wed_col_2', 'proj_wed_3'],
      publishedAt: '2025-02-14T00:00:00Z',
    },
  ];

  return projects.map((p) => {
    const coverId = a(assets, p.coverImg);
    const galleryAssets = p.galleryImgs
      .map((n) => a(assets, n))
      .filter(Boolean) as string[];
    return {
      _type: 'project' as const,
      title: p.title,
      slug: p.slug,
      siteMode: 'wedding',
      client: p.client,
      year: p.year,
      services: p.services,
      overview: p.overview,
      ...(coverId ? { coverImage: imgRef(coverId) } : {}),
      contentBlocks: [
        {
          _key: k(),
          _type: 'heroSection',
          title: p.title,
          tagline: i18nStr(
            `${p.client} · ${p.year}`,
            `${p.client} · ${p.year}`
          ),
          ...(coverId ? { backgroundMedia: bgMedia(coverId) } : {}),
        },
        {
          _key: k(),
          _type: 'mediaGallerySection',
          heading: localBlock(
            'GALLERY',
            'แกลเลอรี',
            'Wedding Gallery',
            'แกลเลอรีงานแต่งงาน'
          ),
          sourceType: 'manual',
          items: galleryAssets.map((aid) => ({
            _key: k(),
            _type: 'galleryItem',
            mediaType: 'image',
            media: mediaBlock(aid, 'Wedding photo', 'ภาพงานแต่งงาน'),
          })),
          background: 'default',
        },
      ],
      publishedAt: p.publishedAt,
      seo: {
        _type: 'seo',
        title: p.title,
        description: p.overview,
      },
    };
  });
}

async function createProjects(
  assets: Map<string, string>
): Promise<{ prodIds: string[]; wedIds: string[] }> {
  console.log('\n🎬 Creating projects...');

  const prodIds: string[] = [];
  const wedIds: string[] = [];

  // Check for existing projects
  const existing = await client.fetch<{ slug: { current: string } }[]>(
    `*[_type == "project" && !(_id in path("drafts.**"))]{slug}`
  );
  const existingSlugs = new Set(existing.map((p) => p.slug?.current));

  for (const proj of buildProductionProjects(assets)) {
    const slug = (proj.slug as { current: string }).current;
    if (existingSlugs.has(slug) && !FORCE) {
      console.log(`  ⏭ Production project "${slug}" already exists, skipping`);
      // Still need the ID for portfolio references
      const found = await client.fetch<{ _id: string }>(
        `*[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id}`,
        { slug }
      );
      if (found) prodIds.push(found._id);
      continue;
    }
    try {
      const doc = await client.create(proj);
      prodIds.push(doc._id);
      console.log(`  ✓ Created production project: ${slug} (${doc._id})`);
    } catch (err) {
      console.error(`  ✗ Failed to create project ${slug}:`, err);
    }
  }

  for (const proj of buildWeddingProjects(assets)) {
    const slug = (proj.slug as { current: string }).current;
    if (existingSlugs.has(slug) && !FORCE) {
      console.log(`  ⏭ Wedding project "${slug}" already exists, skipping`);
      const found = await client.fetch<{ _id: string }>(
        `*[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id}`,
        { slug }
      );
      if (found) wedIds.push(found._id);
      continue;
    }
    try {
      const doc = await client.create(proj);
      wedIds.push(doc._id);
      console.log(`  ✓ Created wedding project: ${slug} (${doc._id})`);
    } catch (err) {
      console.error(`  ✗ Failed to create project ${slug}:`, err);
    }
  }

  console.log(
    `  📦 ${prodIds.length} production + ${wedIds.length} wedding projects ready`
  );
  return { prodIds, wedIds };
}

// ============================================================
// 7. PATCH PRODUCTION PAGES
// ============================================================

async function patchProductionHome(assets: Map<string, string>) {
  console.log('  Patching production home...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{commercialSections}`,
    { id: PAGE_IDS.prod_home }
  );
  const sections = (doc?.commercialSections as Record<string, unknown>[]) || [];

  // Fix hero: add background media
  const heroImg = a(assets, 'prod_hero_1');
  if (sections[0] && heroImg) {
    sections[0] = { ...sections[0], backgroundMedia: bgMedia(heroImg) };
  }

  // Fix media gallery (index 4): replace duplicate images
  const galleryNames = [
    'proj_prod_1',
    'proj_prod_2',
    'proj_prod_3',
    'proj_prod_4',
    'proj_prod_5',
    'gallery_1',
  ];
  const galleryAssets = galleryNames
    .map((n) => a(assets, n))
    .filter(Boolean) as string[];
  if (sections[4] && galleryAssets.length > 0) {
    sections[4] = {
      ...sections[4],
      items: galleryAssets.map((aid, i) => ({
        _key: k(),
        _type: 'galleryItem',
        mediaType: 'image',
        media: mediaBlock(aid, `Portfolio work ${i + 1}`, `ผลงาน ${i + 1}`),
        label: i18nStr(`Project ${i + 1}`, `โปรเจกต์ ${i + 1}`),
      })),
    };
  }

  // Fix CTA banner (index 6): add image if missing
  const ctaImg = a(assets, 'cta_prod');
  if (
    sections[6] &&
    ctaImg &&
    !(sections[6] as Record<string, unknown>).media
  ) {
    sections[6] = {
      ...sections[6],
      media: mediaBlock(ctaImg, 'Start your project', 'เริ่มต้นโปรเจกต์'),
    };
  }

  await client
    .patch(PAGE_IDS.prod_home)
    .set({ commercialSections: sections })
    .commit();
  console.log('    ✓ Production home patched');
}

async function patchProductionAbout(assets: Map<string, string>) {
  console.log('  Patching production about...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{commercialSections}`,
    { id: PAGE_IDS.prod_about }
  );
  const existing = (doc?.commercialSections as Record<string, unknown>[]) || [];

  const colImg = a(assets, 'prod_col_2');
  const newSections = [
    // Two-column: Our Story
    {
      _key: k(),
      _type: 'twoColumnSection',
      layout: 'textLeft',
      content: localBlock(
        'WHO WE ARE',
        'เราคือใคร',
        'Our Story',
        'เรื่องราวของเรา',
        'Founded with a passion for visual storytelling, 56KonFilm brings cinematic excellence to every project. Our team of experienced filmmakers, editors, and colorists work collaboratively to transform creative visions into compelling visual narratives that resonate with audiences.',
        'ก่อตั้งจากความหลงใหลในการเล่าเรื่องผ่านภาพ 56KonFilm มอบความเป็นเลิศด้านภาพยนตร์ให้กับทุกโปรเจกต์ ทีมผู้กำกับ ช่างภาพ นักตัดต่อ และนักลงสีที่มีประสบการณ์ทำงานร่วมกันเพื่อแปลงวิสัยทัศน์สร้างสรรค์ให้เป็นเรื่องเล่าที่น่าประทับใจ'
      ),
      ...(colImg
        ? { media: mediaBlock(colImg, 'Our production team', 'ทีมงานของเรา') }
        : {}),
      ctas: [
        cta('View our work', 'ดูผลงาน', 'secondary', PAGE_IDS.prod_portfolio),
      ],
      background: 'muted',
    },
    // Timeline: Our Journey
    {
      _key: k(),
      _type: 'timelineSection',
      heading: localBlock(
        'MILESTONES',
        'จุดเปลี่ยน',
        'Our Journey',
        'เส้นทางของเรา',
        'From a small passion project to a full-service production house.',
        'จากโปรเจกต์เล็กๆ ด้วยความหลงใหลสู่โปรดักชั่นเฮาส์เต็มรูปแบบ'
      ),
      steps: [
        {
          _key: k(),
          _type: 'timelineStep',
          order: 1,
          title: i18nStr('Founded', 'ก่อตั้ง'),
          description: i18nTxt(
            '56KonFilm was born from a shared love of cinema and storytelling.',
            '56KonFilm ถือกำเนิดจากความรักในภาพยนตร์และการเล่าเรื่อง'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 2,
          title: i18nStr('First Major Campaign', 'แคมเปญใหญ่ครั้งแรก'),
          description: i18nTxt(
            'Landed our first nationwide TVC campaign for a leading brand.',
            'ได้งาน TVC ระดับประเทศครั้งแรกสำหรับแบรนด์ชั้นนำ'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 3,
          title: i18nStr('Wedding Division', 'แผนกงานแต่งงาน'),
          description: i18nTxt(
            'Expanded into premium wedding cinematography services.',
            'ขยายสู่บริการถ่ายวิดีโองานแต่งงานระดับพรีเมียม'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 4,
          title: i18nStr('200+ Projects', 'กว่า 200 โปรเจกต์'),
          description: i18nTxt(
            'Reached the milestone of over 200 completed projects across all categories.',
            'ก้าวผ่านหลักชัยของผลงานที่สำเร็จกว่า 200 โปรเจกต์ครอบคลุมทุกประเภท'
          ),
        },
      ],
      background: 'default',
    },
    // Testimonials
    {
      _key: k(),
      _type: 'testimonialSection',
      heading: localBlock(
        'TESTIMONIALS',
        'รีวิว',
        'What Our Clients Say',
        'ลูกค้าของเราพูดถึงเรา'
      ),
      testimonials: [
        {
          _key: k(),
          _type: 'testimonialItem',
          quote: i18nTxt(
            '56KonFilm delivered beyond our expectations. The quality of their work rivals international productions.',
            '56KonFilm ส่งมอบงานเกินความคาดหมาย คุณภาพงานเทียบเท่าโปรดักชั่นระดับนานาชาติ'
          ),
          authorName: 'Somchai Rattanakorn',
          authorTitle: 'Marketing Director, SCG',
          ...(a(assets, 'avatar_1')
            ? { authorImage: imgRef(a(assets, 'avatar_1')!) }
            : {}),
        },
        {
          _key: k(),
          _type: 'testimonialItem',
          quote: i18nTxt(
            'Professional, creative, and incredibly easy to work with. They truly understand the art of visual storytelling.',
            'มืออาชีพ สร้างสรรค์ และทำงานด้วยง่ายมาก พวกเขาเข้าใจศิลปะของการเล่าเรื่องด้วยภาพอย่างแท้จริง'
          ),
          authorName: 'Nattaya Srisawat',
          authorTitle: 'Brand Manager, Bangkok Bank',
          ...(a(assets, 'avatar_2')
            ? { authorImage: imgRef(a(assets, 'avatar_2')!) }
            : {}),
        },
        {
          _key: k(),
          _type: 'testimonialItem',
          quote: i18nTxt(
            'The music video they produced for us went viral. Their creative direction and attention to detail is unmatched.',
            'มิวสิควิดีโอที่พวกเขาทำให้เราไวรัลไปทั่ว การกำกับสร้างสรรค์และความใส่ใจในรายละเอียดไม่มีใครเทียบได้'
          ),
          authorName: 'James Wilson',
          authorTitle: 'A&R Manager, Universal Music',
          ...(a(assets, 'avatar_3')
            ? { authorImage: imgRef(a(assets, 'avatar_3')!) }
            : {}),
        },
      ],
      background: 'muted',
    },
  ];

  await client
    .patch(PAGE_IDS.prod_about)
    .set({ commercialSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Production about patched');
}

async function patchProductionServices(assets: Map<string, string>) {
  console.log('  Patching production services...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{commercialSections}`,
    { id: PAGE_IDS.prod_services }
  );
  const existing = (doc?.commercialSections as Record<string, unknown>[]) || [];

  const ctaImg = a(assets, 'cta_prod');
  const newSections = [
    // Cards: Our Services
    {
      _key: k(),
      _type: 'cardCollectionSection',
      title: i18nStr('OUR SERVICES', 'บริการของเรา'),
      intro: i18nTxt(
        'End-to-end production capabilities, from concept to delivery. We handle every aspect of your visual project.',
        'ความสามารถด้านการผลิตแบบครบวงจร ตั้งแต่คอนเซปต์จนถึงส่งมอบ เราดูแลทุกด้านของโปรเจกต์ภาพของคุณ'
      ),
      columns: 4,
      background: 'default',
      cards: [
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Video Production', 'โปรดักชั่นวิดีโอ'),
          body: i18nTxt(
            'Full-service video production from scripting to final cut. TVC, corporate videos, and digital content.',
            'โปรดักชั่นวิดีโอครบวงจรตั้งแต่เขียนบทจนถึงตัดต่อ งานโฆษณา วิดีโอองค์กร และคอนเทนต์ดิจิทัล'
          ),
          variant: 'default',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Post-Production', 'โพสต์โปรดักชั่น'),
          body: i18nTxt(
            'Professional editing, color grading, and visual effects that bring your footage to cinematic life.',
            'ตัดต่อ ลงสี และเอฟเฟกต์ภาพมืออาชีพที่ทำให้ฟุตเทจของคุณมีชีวิตชีวาแบบภาพยนตร์'
          ),
          variant: 'default',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Aerial & Drone', 'ถ่ายมุมสูงด้วยโดรน'),
          body: i18nTxt(
            'Licensed drone cinematography for stunning aerial perspectives. Indoor and outdoor capabilities.',
            'ถ่ายภาพด้วยโดรนแบบมีใบอนุญาตเพื่อมุมมองทางอากาศที่น่าทึ่ง ทั้งในร่มและกลางแจ้ง'
          ),
          variant: 'default',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Sound Design', 'ออกแบบเสียง'),
          body: i18nTxt(
            'Custom sound design, music licensing, and professional audio mixing for immersive storytelling.',
            'ออกแบบเสียงเฉพาะ ลิขสิทธิ์เพลง และมิกซ์เสียงมืออาชีพเพื่อการเล่าเรื่องที่สมจริง'
          ),
          variant: 'default',
        },
      ],
    },
    // Timeline: Our Process
    {
      _key: k(),
      _type: 'timelineSection',
      heading: localBlock(
        'WORKFLOW',
        'ขั้นตอนการทำงาน',
        'Our Process',
        'กระบวนการของเรา',
        'A proven five-step process that ensures quality and efficiency at every stage.',
        'กระบวนการ 5 ขั้นตอนที่พิสูจน์แล้วว่าให้ทั้งคุณภาพและประสิทธิภาพในทุกขั้นตอน'
      ),
      steps: [
        {
          _key: k(),
          _type: 'timelineStep',
          order: 1,
          title: i18nStr('Brief & Concept', 'รับบรีฟ & คอนเซปต์'),
          description: i18nTxt(
            'We listen, research, and develop a creative concept that aligns with your goals.',
            'เรารับฟัง วิจัย และพัฒนาคอนเซปต์สร้างสรรค์ที่สอดคล้องกับเป้าหมายของคุณ'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 2,
          title: i18nStr('Pre-Production', 'ก่อนการผลิต'),
          description: i18nTxt(
            'Storyboarding, casting, location scouting, and production planning.',
            'สตอรี่บอร์ด แคสติ้ง เลือกสถานที่ และวางแผนการผลิต'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 3,
          title: i18nStr('Production', 'การถ่ายทำ'),
          description: i18nTxt(
            'Professional crew, cinema-grade equipment, and meticulous execution on set.',
            'ทีมงานมืออาชีพ อุปกรณ์ระดับภาพยนตร์ และการดำเนินงานอย่างพิถีพิถัน'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 4,
          title: i18nStr('Post-Production', 'หลังการผลิต'),
          description: i18nTxt(
            'Editing, color grading, sound design, VFX, and iterative revisions.',
            'ตัดต่อ ลงสี ออกแบบเสียง VFX และปรับปรุงตามฟีดแบค'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 5,
          title: i18nStr('Delivery', 'ส่งมอบ'),
          description: i18nTxt(
            'Final mastering in all required formats, delivered on time and on spec.',
            'มาสเตอร์ริ่งขั้นสุดท้ายในทุกฟอร์แมต ส่งมอบตรงเวลาและตามสเปค'
          ),
        },
      ],
      background: 'muted',
    },
    // CTA Banner
    {
      _key: k(),
      _type: 'ctaBannerSection',
      content: localBlock(
        'START A PROJECT',
        'เริ่มต้นโปรเจกต์',
        'Ready to bring your vision to life?',
        'พร้อมที่จะทำให้วิสัยทัศน์ของคุณเป็นจริงหรือยัง?',
        "From concept to final cut, we are your production partner. Let's build something extraordinary.",
        'จากคอนเซปต์จนถึงชิ้นงานสุดท้าย เราคือพาร์ทเนอร์ด้านการผลิตของคุณ มาสร้างสิ่งพิเศษร่วมกัน'
      ),
      ...(ctaImg
        ? { media: mediaBlock(ctaImg, 'Get in touch', 'ติดต่อเรา') }
        : {}),
      ctas: [cta('Contact us', 'ติดต่อเรา', 'primary', PAGE_IDS.prod_contact)],
      layout: 'textLeft',
      background: 'default',
    },
  ];

  await client
    .patch(PAGE_IDS.prod_services)
    .set({ commercialSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Production services patched');
}

async function patchProductionPortfolio(
  assets: Map<string, string>,
  projectIds: string[]
) {
  console.log('  Patching production portfolio...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{commercialSections}`,
    { id: PAGE_IDS.prod_portfolio }
  );
  const existing = (doc?.commercialSections as Record<string, unknown>[]) || [];

  const newSections = [
    // Media gallery from projects
    {
      _key: k(),
      _type: 'mediaGallerySection',
      heading: localBlock(
        'SELECTED WORKS',
        'ผลงานคัดสรร',
        'Our Portfolio',
        'ผลงานของเรา',
        'A curated selection of our finest productions across commercial, music, and documentary genres.',
        'ผลงานที่คัดสรรมาแล้วจากทุกประเภท ทั้งโฆษณา ดนตรี และสารคดี'
      ),
      sourceType: 'projects',
      selectedProjects: projectIds
        .slice(0, 6)
        .map((id) => ({ _key: k(), _ref: id, _type: 'reference' })),
      cta: cta('View all projects', 'ดูโปรเจกต์ทั้งหมด', 'secondary'),
      background: 'default',
    },
    // Philosophy
    {
      _key: k(),
      _type: 'philosophySection',
      quote: i18nTxt(
        "Every frame tells a story.\nWe make sure it's yours.",
        'ทุกเฟรมเล่าเรื่องราว\nเราทำให้แน่ใจว่ามันเป็นของคุณ'
      ),
      background: 'muted',
    },
  ];

  await client
    .patch(PAGE_IDS.prod_portfolio)
    .set({ commercialSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Production portfolio patched');
}

async function patchProductionContact(assets: Map<string, string>) {
  console.log('  Patching production contact...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{commercialSections}`,
    { id: PAGE_IDS.prod_contact }
  );
  const existing = (doc?.commercialSections as Record<string, unknown>[]) || [];

  const colImg = a(assets, 'prod_col_3');
  const ctaImg = a(assets, 'cta_prod');
  const newSections = [
    {
      _key: k(),
      _type: 'twoColumnSection',
      layout: 'textLeft',
      content: localBlock(
        'GET IN TOUCH',
        'ติดต่อเรา',
        "Let's Talk",
        'มาคุยกันเถอะ',
        '96/75 M.3, Chang Wattana, Klong Gleaur, Pak Kret, Nonthaburi, Thailand\n\nTel. +6682 552 8992 (K.Nut)\nTel. +6665 551 2954 (K.Miki)\n\nOpen Monday – Saturday, 9:00 – 18:00',
        '96/75 หมู่ 3 ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี 11120\n\nโทร 082 552 8992 (คุณนัท)\nโทร 065 551 2954 (คุณมุก)\n\nเปิดทำการ จันทร์ – เสาร์ 9:00 – 18:00'
      ),
      ...(colImg
        ? { media: mediaBlock(colImg, 'Our studio', 'สตูดิโอของเรา') }
        : {}),
      background: 'muted',
    },
    {
      _key: k(),
      _type: 'ctaBannerSection',
      content: localBlock(
        'COLLABORATE',
        'ร่วมงาน',
        "Let's create something extraordinary together",
        'มาสร้างสรรค์สิ่งพิเศษร่วมกัน',
        "Whether you have a clear brief or just an idea, we're ready to listen.",
        'ไม่ว่าคุณจะมีบรีฟชัดเจนหรือแค่ไอเดีย เราพร้อมรับฟัง'
      ),
      ...(ctaImg
        ? { media: mediaBlock(ctaImg, 'Collaborate with us', 'ร่วมงานกับเรา') }
        : {}),
      ctas: [
        cta(
          'Send us a message',
          'ส่งข้อความถึงเรา',
          'primary',
          undefined,
          'mailto:hello@56konfilm.com'
        ),
      ],
      layout: 'textLeft',
      background: 'default',
    },
  ];

  await client
    .patch(PAGE_IDS.prod_contact)
    .set({ commercialSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Production contact patched');
}

// ============================================================
// 8. PATCH WEDDING PAGES
// ============================================================

async function patchWeddingHome(assets: Map<string, string>) {
  console.log('  Patching wedding home...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{weddingSections}`,
    { id: PAGE_IDS.wed_home }
  );
  const sections = (doc?.weddingSections as Record<string, unknown>[]) || [];

  // Fix philosophy (index 1): add Thai translation
  if (
    sections[1] &&
    (sections[1] as Record<string, unknown>)._type === 'philosophySection'
  ) {
    sections[1] = {
      ...sections[1],
      quote: i18nTxt(
        "We take our craft to heart\nas it's truly valuable in life",
        'เราทุ่มเทให้กับงานของเราด้วยใจ\nเพราะมันมีคุณค่าอย่างแท้จริงในชีวิต'
      ),
    };
  }

  // Fix twoColumn (index 2): replace lorem ipsum
  if (
    sections[2] &&
    (sections[2] as Record<string, unknown>)._type === 'twoColumnSection'
  ) {
    sections[2] = {
      ...sections[2],
      content: localBlock(
        'Who We Are',
        'เราคือใคร',
        'Your Love Story, Told with Heart',
        'เรื่องราวความรักของคุณ เล่าจากใจ',
        'We are a team of passionate filmmakers who believe every wedding deserves a film as unique as the couple. Our cinematic, documentary approach captures the real emotions and candid moments that make your day unforgettable.',
        'เราคือทีมนักทำหนังที่หลงใหลในการเล่าเรื่อง เราเชื่อว่าทุกงานแต่งงานสมควรได้รับวิดีโอที่เป็นเอกลักษณ์เฉพาะตัว ด้วยแนวทางแบบซีเนมาติกและสารคดี เราจับภาพอารมณ์จริงๆ และช่วงเวลาที่ทำให้วันพิเศษของคุณเป็นที่จดจำตลอดไป'
      ),
    };
  }

  // Append new sections
  const wedGalleryAssets = [
    'proj_wed_1',
    'proj_wed_2',
    'proj_wed_3',
    'proj_wed_4',
  ]
    .map((n) => a(assets, n))
    .filter(Boolean) as string[];
  const ctaImg = a(assets, 'cta_wed');

  const newSections = [
    // Media Gallery
    {
      _key: k(),
      _type: 'mediaGallerySection',
      heading: localBlock(
        'OUR WORK',
        'ผลงาน',
        'Recent Wedding Films',
        'ผลงานวิดีโองานแต่งล่าสุด'
      ),
      sourceType: 'manual',
      items: wedGalleryAssets.map((aid, i) => ({
        _key: k(),
        _type: 'galleryItem',
        mediaType: 'image',
        media: mediaBlock(
          aid,
          `Wedding film ${i + 1}`,
          `วิดีโองานแต่ง ${i + 1}`
        ),
      })),
      cta: cta('View all', 'ดูทั้งหมด', 'secondary', PAGE_IDS.wed_portfolio),
      background: 'default',
    },
    // Testimonials
    {
      _key: k(),
      _type: 'testimonialSection',
      heading: localBlock(
        'REVIEWS',
        'รีวิว',
        'Love Letters from Our Couples',
        'เสียงจากคู่รักของเรา'
      ),
      testimonials: [
        {
          _key: k(),
          _type: 'testimonialItem',
          quote: i18nTxt(
            "Watching our wedding film for the first time, we cried happy tears all over again. They captured moments we didn't even know happened.",
            'ตอนที่เราดูวิดีโองานแต่งครั้งแรก เราร้องไห้ด้วยความสุขอีกครั้ง พวกเขาจับภาพช่วงเวลาที่เราไม่รู้ด้วยซ้ำว่าเกิดขึ้น'
          ),
          authorName: 'Natcha & Prem',
          authorTitle: 'Garden Wedding, Nakhon Ratchasima',
          ...(a(assets, 'avatar_4')
            ? { authorImage: imgRef(a(assets, 'avatar_4')!) }
            : {}),
        },
        {
          _key: k(),
          _type: 'testimonialItem',
          quote: i18nTxt(
            'The same-day edit at our reception had our guests in tears. Absolutely incredible work.',
            'วิดีโอ Same-Day Edit ในงานเลี้ยงทำให้แขกของเราน้ำตาซึม ผลงานเหลือเชื่อจริงๆ'
          ),
          authorName: 'Sarah & James',
          authorTitle: 'Beach Wedding, Krabi',
          ...(a(assets, 'avatar_2')
            ? { authorImage: imgRef(a(assets, 'avatar_2')!) }
            : {}),
        },
        {
          _key: k(),
          _type: 'testimonialItem',
          quote: i18nTxt(
            "They felt like family from the first meeting. Professional, warm, and so talented. Our film is a treasure we'll keep forever.",
            'พวกเขาเหมือนครอบครัวตั้งแต่การพบกันครั้งแรก มืออาชีพ อบอุ่น และมีพรสวรรค์มาก วิดีโอของเราเป็นสมบัติที่เราจะเก็บรักษาตลอดไป'
          ),
          authorName: 'Mook & Tong',
          authorTitle: 'Thai-Chinese Wedding, Bangkok',
          ...(a(assets, 'avatar_1')
            ? { authorImage: imgRef(a(assets, 'avatar_1')!) }
            : {}),
        },
      ],
      background: 'muted',
    },
    // CTA Banner
    {
      _key: k(),
      _type: 'ctaBannerSection',
      content: localBlock(
        'BOOK YOUR DATE',
        'จองวันของคุณ',
        'Your love story, our lens',
        'เรื่องราวความรักของคุณ เลนส์ของเรา',
        "Let's create a wedding film that you'll treasure for generations.",
        'มาสร้างวิดีโองานแต่งที่คุณจะเก็บรักษาไว้ชั่วลูกชั่วหลาน'
      ),
      ...(ctaImg
        ? {
            media: mediaBlock(
              ctaImg,
              'Contact us for wedding',
              'ติดต่อสำหรับงานแต่งงาน'
            ),
          }
        : {}),
      ctas: [cta('Inquire now', 'สอบถามเลย', 'primary', PAGE_IDS.wed_contact)],
      layout: 'textLeft',
      background: 'default',
    },
  ];

  await client
    .patch(PAGE_IDS.wed_home)
    .set({ weddingSections: [...sections, ...newSections] })
    .commit();
  console.log('    ✓ Wedding home patched');
}

async function patchWeddingAbout(assets: Map<string, string>) {
  console.log('  Patching wedding about...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{weddingSections}`,
    { id: PAGE_IDS.wed_about }
  );
  const existing = (doc?.weddingSections as Record<string, unknown>[]) || [];

  const colImg = a(assets, 'wed_col_1');
  const newSections = [
    {
      _key: k(),
      _type: 'twoColumnSection',
      layout: 'textLeft',
      content: localBlock(
        'OUR APPROACH',
        'แนวทางของเรา',
        'More Than Just a Video',
        'มากกว่าแค่วิดีโอ',
        "We approach every wedding as a documentary filmmaker would — observing, not directing. We believe the most beautiful moments are the real ones: a father's proud smile, a best friend's teary speech, the nervous excitement before the first look.",
        'เราเข้าหาทุกงานแต่งงานในแบบนักทำสารคดี — สังเกตการณ์ ไม่ใช่กำกับ เราเชื่อว่าช่วงเวลาที่สวยงามที่สุดคือช่วงเวลาจริง: รอยยิ้มอันภาคภูมิใจของพ่อ สุนทรพจน์ที่เพื่อนซี้น้ำตาซึม ความตื่นเต้นก่อนเห็นหน้ากันครั้งแรก'
      ),
      ...(colImg
        ? {
            media: mediaBlock(
              colImg,
              'Wedding filmmaking',
              'การถ่ายวิดีโองานแต่งงาน'
            ),
          }
        : {}),
      ctas: [
        cta('See our films', 'ดูผลงาน', 'secondary', PAGE_IDS.wed_portfolio),
      ],
      background: 'muted',
    },
    {
      _key: k(),
      _type: 'cardCollectionSection',
      title: i18nStr('WHY CHOOSE US', 'ทำไมต้องเลือกเรา'),
      intro: i18nTxt(
        'What makes a 56KonFilm wedding different.',
        'สิ่งที่ทำให้งานแต่งกับ 56KonFilm แตกต่าง'
      ),
      columns: 3,
      background: 'default',
      cards: [
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Cinematic Quality', 'คุณภาพระดับภาพยนตร์'),
          body: i18nTxt(
            'We use cinema-grade cameras, lenses, and stabilizers. Your wedding film looks and feels like a feature film.',
            'เราใช้กล้อง เลนส์ และสเตบิไลเซอร์ระดับภาพยนตร์ วิดีโองานแต่งของคุณจะดูและรู้สึกเหมือนหนังเรื่องหนึ่ง'
          ),
          variant: 'default',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Emotional Storytelling', 'เล่าเรื่องจากอารมณ์'),
          body: i18nTxt(
            "We don't just capture what happened — we capture how it felt. Every edit is driven by emotion, not chronology.",
            'เราไม่ได้แค่บันทึกสิ่งที่เกิดขึ้น — เราบันทึกว่ามันรู้สึกอย่างไร ทุกการตัดต่อขับเคลื่อนด้วยอารมณ์ ไม่ใช่ลำดับเวลา'
          ),
          variant: 'default',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Bilingual Team', 'ทีมสองภาษา'),
          body: i18nTxt(
            'Fluent in Thai and English, we work seamlessly with international couples and Thai families alike.',
            'สื่อสารได้ทั้งไทยและอังกฤษ เราทำงานได้อย่างลื่นไหลกับทั้งคู่รักต่างชาติและครอบครัวไทย'
          ),
          variant: 'default',
        },
      ],
    },
    {
      _key: k(),
      _type: 'philosophySection',
      quote: i18nTxt(
        "We don't just record your wedding.\nWe craft your legacy.",
        'เราไม่ได้แค่ถ่ายงานแต่ง\nเราสร้างมรดกของคุณ'
      ),
      background: 'muted',
    },
  ];

  await client
    .patch(PAGE_IDS.wed_about)
    .set({ weddingSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Wedding about patched');
}

async function patchWeddingServices(assets: Map<string, string>) {
  console.log('  Patching wedding services...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{weddingSections}`,
    { id: PAGE_IDS.wed_services }
  );
  const existing = (doc?.weddingSections as Record<string, unknown>[]) || [];

  const newSections = [
    {
      _key: k(),
      _type: 'cardCollectionSection',
      title: i18nStr('OUR WEDDING SERVICES', 'บริการงานแต่งงาน'),
      intro: i18nTxt(
        'Comprehensive wedding film services tailored to your needs.',
        'บริการวิดีโองานแต่งงานครบวงจรที่ออกแบบมาเพื่อคุณ'
      ),
      columns: 4,
      background: 'default',
      cards: [
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Wedding Cinematography', 'ถ่ายวิดีโองานแต่งงาน'),
          body: i18nTxt(
            'Full-day coverage with multiple camera angles, capturing every precious moment from preparations to the last dance.',
            'ถ่ายทำตลอดทั้งวันด้วยหลายมุมกล้อง บันทึกทุกช่วงเวลาอันล้ำค่าตั้งแต่เตรียมตัวจนถึงเต้นรำสุดท้าย'
          ),
          variant: 'default',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Same-Day Edit', 'ตัดต่อวันเดียว'),
          body: i18nTxt(
            'A highlight film edited and screened at your reception the same evening — the ultimate guest experience.',
            'ไฮไลท์ฟิล์มที่ตัดต่อและฉายในงานเลี้ยงเย็นวันเดียวกัน — ประสบการณ์สุดพิเศษสำหรับแขก'
          ),
          variant: 'highlighted',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Pre-Wedding Film', 'ถ่ายพรีเวดดิ้ง'),
          body: i18nTxt(
            'A cinematic short film of your love story, shot at a location of your choice with professional direction.',
            'หนังสั้นเล่าเรื่องราวความรักของคุณ ถ่ายทำที่สถานที่ที่คุณเลือกพร้อมการกำกับมืออาชีพ'
          ),
          variant: 'default',
        },
        {
          _key: k(),
          _type: 'cardItem',
          title: i18nStr('Live Streaming', 'ถ่ายทอดสด'),
          body: i18nTxt(
            "Professional multi-camera live streaming for guests who can't attend in person. HD quality, stable connection.",
            'ถ่ายทอดสดหลายกล้องสำหรับแขกที่ไม่สามารถมาร่วมงานได้ คุณภาพ HD สัญญาณเสถียร'
          ),
          variant: 'default',
        },
      ],
    },
    {
      _key: k(),
      _type: 'timelineSection',
      heading: localBlock(
        'YOUR WEDDING DAY',
        'วันงานแต่งของคุณ',
        'How We Work on the Big Day',
        'เราทำงานอย่างไรในวันสำคัญ',
        'Our team integrates seamlessly into your wedding day without disrupting a single moment.',
        'ทีมของเราจะเข้ากับวันงานแต่งของคุณอย่างลื่นไหลโดยไม่รบกวนแม้แต่วินาทีเดียว'
      ),
      steps: [
        {
          _key: k(),
          _type: 'timelineStep',
          order: 1,
          title: i18nStr('Preparations', 'เตรียมตัว'),
          description: i18nTxt(
            'We arrive early to capture the excitement — hair, makeup, nervous laughter, and heartfelt letters.',
            'เรามาถึงแต่เช้าเพื่อบันทึกความตื่นเต้น — แต่งหน้า ทำผม เสียงหัวเราะ และจดหมายจากใจ'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 2,
          title: i18nStr('Ceremony', 'พิธี'),
          description: i18nTxt(
            'Discreet multi-angle coverage of your vows, ring exchange, and the moment you become one.',
            'ถ่ายทำหลายมุมอย่างเนียน บันทึกคำสาบาน การสวมแหวน และช่วงเวลาที่คุณเป็นหนึ่งเดียว'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 3,
          title: i18nStr('Celebration', 'เฉลิมฉลอง'),
          description: i18nTxt(
            'Toasts, first dance, cake cutting, and all the spontaneous moments in between.',
            'ดื่มอวยพร เต้นรำ ตัดเค้ก และทุกช่วงเวลาที่เกิดขึ้นอย่างเป็นธรรมชาติ'
          ),
        },
        {
          _key: k(),
          _type: 'timelineStep',
          order: 4,
          title: i18nStr('Delivery', 'ส่งมอบ'),
          description: i18nTxt(
            'Your cinematic highlight film and full ceremony delivered within 3-6 weeks.',
            'ไฮไลท์ฟิล์มแบบซีเนมาติกและวิดีโอพิธีฉบับเต็มจัดส่งภายใน 3-6 สัปดาห์'
          ),
        },
      ],
      background: 'muted',
    },
  ];

  await client
    .patch(PAGE_IDS.wed_services)
    .set({ weddingSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Wedding services patched');
}

async function patchWeddingPortfolio(
  assets: Map<string, string>,
  projectIds: string[]
) {
  console.log('  Patching wedding portfolio...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{weddingSections}`,
    { id: PAGE_IDS.wed_portfolio }
  );
  const existing = (doc?.weddingSections as Record<string, unknown>[]) || [];

  const newSections = [
    {
      _key: k(),
      _type: 'mediaGallerySection',
      heading: localBlock(
        'OUR COUPLES',
        'คู่รักของเรา',
        'Wedding Portfolio',
        'ผลงานงานแต่งงาน',
        'Every love story is unique. Here are some of our favorites.',
        'เรื่องราวความรักทุกเรื่องไม่เหมือนกัน นี่คือผลงานที่เราชื่นชอบ'
      ),
      sourceType: 'projects',
      selectedProjects: projectIds
        .slice(0, 6)
        .map((id) => ({ _key: k(), _ref: id, _type: 'reference' })),
      background: 'default',
    },
  ];

  await client
    .patch(PAGE_IDS.wed_portfolio)
    .set({ weddingSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Wedding portfolio patched');
}

async function patchWeddingPackages() {
  console.log('  Patching wedding packages...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{weddingSections}`,
    { id: PAGE_IDS.wed_packages }
  );
  const existing = (doc?.weddingSections as Record<string, unknown>[]) || [];

  const newSections = [
    {
      _key: k(),
      _type: 'packagesSection',
      heading: localBlock(
        'PRICING',
        'ราคา',
        'Our Wedding Packages',
        'แพ็กเกจงานแต่งงาน',
        'Choose the package that fits your wedding. All packages include a pre-wedding consultation.',
        'เลือกแพ็กเกจที่เหมาะกับงานแต่งของคุณ ทุกแพ็กเกจรวมการปรึกษาก่อนงานแต่ง'
      ),
      packages: [
        {
          _key: k(),
          _type: 'packageItem',
          title: i18nStr('Essential', 'เอสเซนเชียล'),
          price: 59000,
          currency: 'THB',
          features: [
            '1 videographer',
            'Highlight film (3-5 min)',
            'Ceremony + reception coverage',
            'Color graded final output',
            '4-6 weeks delivery',
          ],
          featured: false,
          cta: cta('Book now', 'จองเลย', 'secondary', PAGE_IDS.wed_contact),
        },
        {
          _key: k(),
          _type: 'packageItem',
          title: i18nStr('Signature', 'ซิกเนเจอร์'),
          price: 99000,
          currency: 'THB',
          features: [
            '2 videographers',
            'Highlight film + full ceremony',
            'Pre-wedding consultation',
            'Same-day teaser (60s)',
            'Cinematic color grading',
            '3-4 weeks delivery',
          ],
          featured: true,
          cta: cta('Book now', 'จองเลย', 'primary', PAGE_IDS.wed_contact),
        },
        {
          _key: k(),
          _type: 'packageItem',
          title: i18nStr('Premiere', 'พรีเมียร์'),
          price: 159000,
          currency: 'THB',
          features: [
            '3 videographers',
            'Cinematic feature film (15-20 min)',
            'Aerial drone footage',
            'Same-day edit (3-5 min)',
            'Live streaming (HD)',
            'Priority 2-3 weeks delivery',
          ],
          featured: false,
          cta: cta('Book now', 'จองเลย', 'secondary', PAGE_IDS.wed_contact),
        },
      ],
      background: 'default',
    },
  ];

  await client
    .patch(PAGE_IDS.wed_packages)
    .set({ weddingSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Wedding packages patched');
}

async function patchWeddingContact(assets: Map<string, string>) {
  console.log('  Patching wedding contact...');

  const doc = await client.fetch<Record<string, unknown>>(
    `*[_id == $id][0]{weddingSections}`,
    { id: PAGE_IDS.wed_contact }
  );
  const existing = (doc?.weddingSections as Record<string, unknown>[]) || [];

  const colImg = a(assets, 'wed_col_2');
  const ctaImg = a(assets, 'cta_wed');
  const newSections = [
    {
      _key: k(),
      _type: 'twoColumnSection',
      layout: 'textLeft',
      content: localBlock(
        'INQUIRE',
        'สอบถาม',
        "Let's Plan Your Wedding Film",
        'มาวางแผนวิดีโองานแต่งกัน',
        "Tell us about your wedding day and we'll craft a package that's perfect for you.\n\nTel. +6682 552 8992 (K.Nut)\nTel. +6665 551 2954 (K.Miki)",
        'เล่าให้เราฟังเกี่ยวกับวันงานแต่งของคุณ แล้วเราจะออกแบบแพ็กเกจที่เหมาะสมที่สุด\n\nโทร 082 552 8992 (คุณนัท)\nโทร 065 551 2954 (คุณมุก)'
      ),
      ...(colImg
        ? {
            media: mediaBlock(
              colImg,
              'Contact us for wedding',
              'ติดต่อสำหรับงานแต่งงาน'
            ),
          }
        : {}),
      ctas: [
        cta('View packages', 'ดูแพ็กเกจ', 'secondary', PAGE_IDS.wed_packages),
      ],
      background: 'muted',
    },
    {
      _key: k(),
      _type: 'ctaBannerSection',
      content: localBlock(
        'YOUR STORY AWAITS',
        'เรื่องราวของคุณรออยู่',
        "Let's plan your perfect wedding film",
        'มาวางแผนวิดีโองานแต่งที่สมบูรณ์แบบ',
        "Every great love story deserves a beautiful film. We'd be honored to tell yours.",
        'ทุกเรื่องราวความรักสมควรได้รับวิดีโอที่สวยงาม เราจะเป็นเกียรติที่ได้เล่าเรื่องของคุณ'
      ),
      ...(ctaImg
        ? { media: mediaBlock(ctaImg, 'Wedding inquiry', 'สอบถามงานแต่งงาน') }
        : {}),
      ctas: [
        cta(
          'Send inquiry',
          'ส่งคำถา��',
          'primary',
          undefined,
          'mailto:wedding@56konfilm.com'
        ),
      ],
      layout: 'textLeft',
      background: 'default',
    },
  ];

  await client
    .patch(PAGE_IDS.wed_contact)
    .set({ weddingSections: [...existing, ...newSections] })
    .commit();
  console.log('    ✓ Wedding contact patched');
}

// ============================================================
// 9. CREATE BLOG POSTS
// ============================================================

async function createPosts(assets: Map<string, string>) {
  console.log('\n📝 Creating blog posts...');

  const existing = await client.fetch<{ slug: { current: string } }[]>(
    `*[_type == "post" && defined(slug) && !(_id in path("drafts.**"))]{slug}`
  );
  const existingSlugs = new Set(existing.map((p) => p.slug?.current));

  const posts = [
    {
      title: i18nStr(
        '5 Tips for Choosing the Right Production House',
        '5 เคล็ดลับเลือกโปรดักชั่นเฮาส์ให้ตรงใจ'
      ),
      slug: { _type: 'slug', current: '5-tips-choosing-production-house' },
      publishedAt: '2025-02-10T09:00:00Z',
      imgName: 'blog_1',
      bodyEn: [
        "Choosing a production house is one of the most important decisions you'll make for your brand's visual content. The right partner will elevate your vision, while the wrong one can waste time and budget.",
        'First, look at their portfolio — not just the flashiest piece, but the range and consistency of quality. Second, ask about their process. A professional team will have a clear workflow from brief to delivery.',
        "Third, consider chemistry. You'll be working closely with this team, so communication style matters. Fourth, understand their pricing model upfront to avoid surprises.",
        "Finally, check references. A production house that's proud of their work will happily connect you with past clients. The best partnerships are built on trust and shared creative ambition.",
      ],
      bodyTh: [
        'การเลือกโปรดักชั่นเฮาส์เป็นหนึ่งในการตัดสินใจที่สำคัญที่สุดสำหรับคอนเทนต์ภาพของแบรนด์คุณ พาร์ทเนอร์ที่ใช่จะยกระดับวิสัยทัศน์ของคุณ',
        'อันดับแรก ดูผลงานของพวกเขา — ไม่ใช่แค่ชิ้นงานที่เด่นที่สุด แต่ความหลากหลายและคุณภาพที่สม่ำเสมอ อันดับสอง ถามเรื่องกระบวนการทำงาน ทีมมืออาชีพจะมีขั้นตอนที่ชัดเจนตั้งแต่รับบรีฟจนส่งมอบ',
        'อันดับสาม คุณจะทำงานร่วมกับทีมนี้อย่างใกล้ชิด รูปแบบการสื่อสารจึงสำคัญ อันดับสี่ ทำความเข้าใจโครงสร้างราคาตั้งแต่แรกเพื่อหลีกเลี่ยงเซอร์ไพรส์',
        'สุดท้าย เช็กรีวิว โปรดักชั่นเฮาส์ที่ภูมิใจในผลงานจะยินดีให้คุณติดต่อลูกค้าเก่า ความร่วมมือที่ดีที่สุดสร้างจากความไว้วางใจและความทะเยอทะยานร่วมกัน',
      ],
    },
    {
      title: i18nStr(
        'Behind the Scenes: How We Color Grade a Film',
        'เบื้องหลัง: วิธีที่เราลงสีให้กับภาพยนตร์'
      ),
      slug: { _type: 'slug', current: 'behind-the-scenes-color-grading' },
      publishedAt: '2025-03-05T09:00:00Z',
      imgName: 'blog_2',
      bodyEn: [
        'Color grading is where raw footage transforms into cinematic art. At 56KonFilm, we treat color as an essential storytelling tool — not just a post-production afterthought.',
        'Our process starts with establishing a color palette that matches the mood of the project. A corporate video might call for clean, neutral tones, while a music video could push into bold, saturated looks.',
        'We use DaVinci Resolve for precision grading, working through primary correction, secondary isolation, and creative LUT application. Every skin tone is carefully balanced to look natural and flattering.',
        "The final grade is what gives each project its distinctive visual signature. It's the difference between footage that's technically correct and footage that makes you feel something.",
      ],
      bodyTh: [
        'การลงสีคือจุดที่ฟุตเทจดิบกลายเป็นงานศิลปะระดับภาพยนตร์ ที่ 56KonFilm เราใช้สีเป็นเครื่องมือเล่าเรื่องที่สำคัญ ไม่ใช่แค่ขั้นตอนท้ายๆ ของโพสต์โปรดักชั่น',
        'กระบวนการของเราเริ่มจากการกำหนดพาเลทสีที่เข้ากับอารมณ์ของโปรเจกต์ วิดีโอองค์กรอาจต้องการโทนสะอาดและเป็นกลาง ในขณะที่มิวสิควิดีโออาจเน้นสีจัดและเข้ม',
        'เราใช้ DaVinci Resolve สำหรับการลงสีอย่างแม่นยำ ทำงานผ่าน primary correction, secondary isolation และการใช้ LUT เชิงสร้างสรรค์ โทนผิวทุกอันถูกปรับสมดุลอย่างพิถีพิถัน',
        'การลงสีขั้นสุดท้ายคือสิ่งที่ทำให้แต่ละโปรเจกต์มีเอกลักษณ์ทางภาพที่โดดเด่น มันคือความแตกต่างระหว่างฟุตเทจที่ถูกต้องทางเทคนิคกับฟุตเทจที่ทำให้คุณรู้สึกบางอย่าง',
      ],
    },
    {
      title: i18nStr(
        'Wedding Film Trends for 2025',
        'เทรนด์วิดีโองานแต่งงานปี 2025'
      ),
      slug: { _type: 'slug', current: 'wedding-film-trends-2025' },
      publishedAt: '2025-01-15T09:00:00Z',
      imgName: 'blog_3',
      bodyEn: [
        'The wedding film industry is evolving rapidly. In 2025, couples are looking for films that feel authentic, cinematic, and deeply personal.',
        'Documentary-style filmmaking continues to dominate. Couples want real moments, real emotions, and real laughter — not scripted poses. The \"fly on the wall\" approach captures the genuine essence of the day.',
        'Same-day edits are becoming a must-have, especially for Thai weddings. Guests love seeing a highlight reel during the reception. It creates a shared emotional experience that brings the room together.',
        'Drone footage, intimate audio recordings, and creative first-look sequences are also trending. The key thread? Authenticity. Modern couples want their wedding film to feel like them, not a generic template.',
      ],
      bodyTh: [
        'อุตสาหกรรมวิดีโองานแต่งกำลังพัฒนาอย่างรวดเร็ว ในปี 2025 คู่รักต้องการวิดีโอที่ดูจริง เป็นซีเนมาติก และเป็นส่วนตัวอย่างลึกซึ้ง',
        'การถ่ายแบบสารคดียังคงเป็นที่นิยม คู่รักต้องการช่วงเวลาจริง อารมณ์จริง และเสียงหัวเราะจริง — ไม่ใช่ท่าโพสที่เตรียมมา แนวทาง \"fly on the wall\" จับแก่นแท้ของวันนั้นได้',
        'Same-Day Edit กลายเป็นสิ่งที่ต้องมี โดยเฉพาะสำหรับงานแต่งไทย แขกชื่นชอบการได้ดูไฮไลท์ระหว่างงานเลี้ยง มันสร้างประสบการณ์ทางอารมณ์ร่วมกันที่ทำให้ทุกคนประทับใจ',
        'ภาพจากโดรน การบันทึกเสียงแบบใกล้ชิด และซีเควนซ์ first-look สร้างสรรค์ก็เป็นเทรนด์ สิ่งที่เหมือนกัน? ความจริงแท้ คู่รักยุคใหม่ต้องการวิดีโอที่รู้สึกเหมือนเป็นตัวเอง ไม่ใช่เทมเพลตทั่วไป',
      ],
    },
    {
      title: i18nStr(
        'Why Every Brand Needs a Story Film',
        'ทำไมทุกแบรนด์ต้องมีหนังเล่าเรื่อง'
      ),
      slug: { _type: 'slug', current: 'why-every-brand-needs-story-film' },
      publishedAt: '2025-03-20T09:00:00Z',
      imgName: 'blog_4',
      bodyEn: [
        'In a world of 15-second ads and infinite scroll, brand films cut through the noise. They give your audience a reason to stop, watch, and remember.',
        'A story film goes beyond selling a product — it communicates values, mission, and the human side of your brand. It builds an emotional connection that no amount of banner ads can achieve.',
        "We've seen clients use brand films on their homepage, at trade shows, in investor pitch meetings, and across social media. The ROI extends far beyond a single campaign.",
        'The best time to create your brand film is before you need it urgently. Give yourself time to develop a concept that truly represents who you are. Your brand story is worth telling well.',
      ],
      bodyTh: [
        'ในโลกของโฆษณา 15 วินาทีและการเลื่อนหน้าจอไม่รู้จบ แบรนด์ฟิล์มช่วยตัดผ่านเสียงรบกวน ให้เหตุผลกับผู้ชมในการหยุด ดู และจดจำ',
        'หนังเล่าเรื่องไปไกลกว่าการขายสินค้า — มันสื่อสารค่านิยม พันธกิจ และด้านที่เป็นมนุษย์ของแบรนด์คุณ สร้างการเชื่อมต่อทางอารมณ์ที่ป้ายโฆษณาจำนวนมากไม่สามารถทำได้',
        'เราเห็นลูกค้าใช้แบรนด์ฟิล์มบนหน้าแรกเว็บไซต์ ในงานแสดงสินค้า ในการนำเสนอต่อนักลงทุน และบนโซเชียลมีเดีย ROI ขยายไปไกลกว่าแคมเปญเดียว',
        'เวลาที่ดีที่สุดในการสร้างแบรนด์ฟิล์มคือก่อนที่คุณจะต้องการมันอย่างเร่งด่วน ให้เวลากับตัวเองในการพัฒนาคอนเซปต์ที่เป็นตัวแทนของคุณอย่างแท้จริง เรื่องราวแบรนด์ของคุณคุ้มค่าที่จะเล่าให้ดี',
      ],
    },
  ];

  let created = 0;
  for (const post of posts) {
    const slug = (post.slug as { current: string }).current;
    if (existingSlugs.has(slug) && !FORCE) {
      console.log(`  ⏭ Post "${slug}" already exists, skipping`);
      continue;
    }

    const imgId = a(assets, post.imgName);
    try {
      await client.create({
        _type: 'post',
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        ...(imgId ? { image: imgRef(imgId) } : {}),
        body: portableText(post.bodyEn),
      });
      console.log(`  ✓ Created post: ${slug}`);
      created++;
    } catch (err) {
      console.error(`  ✗ Failed to create post ${slug}:`, err);
    }
  }

  console.log(`  📦 ${created} posts created`);
}

// ============================================================
// 10. PATCH SETTINGS
// ============================================================

async function patchSettings(assets: Map<string, string>) {
  console.log('\n⚙️  Patching settings SEO...');

  const heroImg = a(assets, 'prod_hero_1');
  await client
    .patch('settings')
    .set({
      seo: {
        _type: 'seo',
        title: i18nStr(
          '56KonFilm | Film Production & Wedding Cinematography',
          '56KonFilm | โปรดักชั่นเฮาส์ & ถ่ายวิดีโองานแต่งงาน'
        ),
        description: i18nTxt(
          'Bangkok-based film production company specializing in commercial videos, brand films, and cinematic wedding coverage. Trusted by leading brands across Thailand.',
          'บริษัทผลิตภาพยนตร์ในกรุงเทพฯ เชี่ยวชาญด้านวิดีโอโฆษณา แบรนด์ฟิล์ม และถ่ายวิดีโองานแต่งงานแบบซีเนมาติก ได้รับความไว้วางใจจากแบรนด์ชั้นนำทั่วประเทศไทย'
        ),
        keywords: i18nStr(
          'production house, film production, wedding cinematography, video production bangkok, corporate video thailand, 56konfilm',
          'โปรดักชั่นเฮาส์, ผลิตภาพยนตร์, ถ่ายวิดีโองานแต่งงาน, วิดีโอโปรดักชั่นกรุงเทพ, วิดีโอองค์กร, 56konfilm'
        ),
        ...(heroImg ? { ogImage: imgRef(heroImg) } : {}),
      },
    })
    .commit();

  console.log('  ✓ Settings SEO patched');
}

// ============================================================
// 11. MAIN
// ============================================================

async function main() {
  console.log('🌱 56KonFilm CMS Seed Script');
  console.log(`   Project: ${projectId} / ${dataset}`);
  console.log(`   Force: ${FORCE}`);
  console.log('');

  const stats = { images: 0, projects: 0, pages: 0, posts: 0 };

  // Phase 1: Download & upload images
  let assets: Map<string, string>;
  try {
    assets = await downloadAndUploadAll();
    stats.images = assets.size;
  } catch (err) {
    console.error('❌ Image phase failed:', err);
    assets = new Map();
  }

  // Phase 2: Create projects (needed before portfolio pages)
  let prodProjectIds: string[] = [];
  let wedProjectIds: string[] = [];
  try {
    const result = await createProjects(assets);
    prodProjectIds = result.prodIds;
    wedProjectIds = result.wedIds;
    stats.projects = prodProjectIds.length + wedProjectIds.length;
  } catch (err) {
    console.error('❌ Projects phase failed:', err);
  }

  // Phase 3: Patch pages
  console.log('\n📄 Patching pages...');
  const pageFns = [
    () => patchProductionHome(assets),
    () => patchProductionAbout(assets),
    () => patchProductionServices(assets),
    () => patchProductionPortfolio(assets, prodProjectIds),
    () => patchProductionContact(assets),
    () => patchWeddingHome(assets),
    () => patchWeddingAbout(assets),
    () => patchWeddingServices(assets),
    () => patchWeddingPortfolio(assets, wedProjectIds),
    () => patchWeddingPackages(),
    () => patchWeddingContact(assets),
  ];

  for (const fn of pageFns) {
    try {
      await fn();
      stats.pages++;
    } catch (err) {
      console.error(`  ✗ Page patch failed:`, err);
    }
  }

  // Phase 4: Create blog posts
  try {
    await createPosts(assets);
    stats.posts = 4;
  } catch (err) {
    console.error('❌ Posts phase failed:', err);
  }

  // Phase 5: Patch settings
  try {
    await patchSettings(assets);
  } catch (err) {
    console.error('❌ Settings patch failed:', err);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ Seed complete!');
  console.log(`   📸 ${stats.images} images uploaded`);
  console.log(`   🎬 ${stats.projects} projects created`);
  console.log(`   📄 ${stats.pages} pages patched`);
  console.log(`   📝 ${stats.posts} posts created`);
  console.log('='.repeat(50));
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
