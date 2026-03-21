import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('production'),
  PORT: z.coerce.number().default(3000),
  // --- Sanity Public (เข้าถึงได้ทั้ง Client/Server) ---
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z
    .string({ error: '❌ "PROJECT_ID" is required' })
    .min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.enum(['production', 'development'], {
    error: '❌ Missing or Invalid "SANITY_DATASET"',
  }),
  NEXT_PUBLIC_SANITY_API_VERSION: z.literal('2025-08-12'),

  // --- Sanity Private (เข้าถึงได้เฉพาะ Server) ---
  SANITY_REVALIDATE_SECRET: z.string().min(32).optional(),
  SANITY_API_TOKEN: z.string().min(32).optional(),

  // --- Session Management (สำหรับระบบ Login/CMS) ---
  SANITY_CMS_SESSION_SECRET: z.string().min(32).optional(),
  SANITY_CMS_SESSION_MAX_AGE: z.coerce.number().default(604800),
  SANITY_CMS_REMEMBER_MAX_AGE: z.coerce.number().default(2592000),

  // --- System Defaults ---
  DEFAULT_SITE_MODE: z.enum(['commercial', 'wedding']).default('commercial'),

  // --- Testing Environment ---
  BASE_URL: z.url().optional(),
  TEST_USER_EMAIL: z.email().optional(),
  TEST_USER_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
  SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
  SANITY_CMS_SESSION_SECRET: process.env.SANITY_CMS_SESSION_SECRET,
  SANITY_CMS_SESSION_MAX_AGE: process.env.SANITY_CMS_SESSION_MAX_AGE,
  SANITY_CMS_REMEMBER_MAX_AGE: process.env.SANITY_CMS_REMEMBER_MAX_AGE,
  DEFAULT_SITE_MODE: process.env.DEFAULT_SITE_MODE,
  BASE_URL: process.env.BASE_URL,
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
});

if (!parsed.success) {
  if (typeof window === 'undefined') {
    console.error(
      '❌ Missing or Invalid environment variables:',
      z.treeifyError(parsed.error)
    );
  }

  if (process.env.NODE_ENV !== 'test') {
    throw new Error('❌ Missing or Invalid environment variables');
  }

  console.warn(
    '⚠️  Continuing tests with potentially invalid environment variables.'
  );
}

// In tests, we prefer to have something even if it failed validation.
// Using defaults for missing fields when possible.
export const env = parsed.success
  ? parsed.data
  : envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'test-project',
      NEXT_PUBLIC_SANITY_DATASET: 'production',
      NEXT_PUBLIC_SANITY_API_VERSION: '2025-08-12',
    });
