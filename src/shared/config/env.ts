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

  // --- Contact email (private values must never be passed to client components) ---
  CONTACT_EMAIL_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  // Optional while delivery can be disabled; assertContactEmailConfig requires
  // all five values when enabled. Revisit only if the disabled state is removed.
  RESEND_API_KEY: z.string().optional(),
  CONTACT_EMAIL_FROM: z.string().optional(),
  CONTACT_EMAIL_TO: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // --- System Defaults ---
  DEFAULT_SITE_MODE: z.enum(['production', 'wedding']).default('production'),

  // --- Testing Environment ---
  BASE_URL: z.url().optional(),
  TEST_USER_EMAIL: z.email().optional(),
  TEST_USER_PASSWORD: z.string().optional(),
});

const rawEnv = {
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
  CONTACT_EMAIL_ENABLED: process.env.CONTACT_EMAIL_ENABLED,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_EMAIL_FROM: process.env.CONTACT_EMAIL_FROM,
  CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  DEFAULT_SITE_MODE: process.env.DEFAULT_SITE_MODE,
  BASE_URL: process.env.BASE_URL,
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
};

function validateEnv() {
  const isServer = typeof window === 'undefined';
  const parsed = envSchema.safeParse(rawEnv);
  const isLighthouse = process.env.LHCI === 'true';

  // --- กรณีที่ 1: Validation ผ่านฉลุย ---
  if (parsed.success) {
    const data = parsed.data;
    assertContactEmailConfig(data, isServer);
    const isLiveEnvironment = data.NODE_ENV !== 'test';
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

    // ** FAIL FAST LOGIC **
    // ถ้าเป็น Production และไม่ใช่ช่วง Build
    // เช็ก env ที่กำหนด .optional() แต่ต้องใช้ใน live environment
    if (isLiveEnvironment && !isBuild && isServer && !isLighthouse) {
      if (
        !data.SANITY_REVALIDATE_SECRET ||
        !data.SANITY_API_TOKEN ||
        !data.SANITY_CMS_SESSION_SECRET
      ) {
        throw new Error(
          '❌ [FATAL] Missing required environment variables for Live environment'
        );
      }
    }
    return data;
  }

  // --- กรณีที่ 2: เป็นโหมด Test (Mock Data) ---
  if (process.env.NODE_ENV === 'test' || isLighthouse) {
    const data = envSchema.parse({
      ...rawEnv,
      NEXT_PUBLIC_SANITY_PROJECT_ID:
        rawEnv.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'test-project',
      NEXT_PUBLIC_SANITY_DATASET: 'production',
      NEXT_PUBLIC_SANITY_API_VERSION: '2025-08-12',
      SANITY_API_TOKEN:
        rawEnv.SANITY_API_TOKEN ?? 'mock_token_32_characters_long_for_test',
      SANITY_REVALIDATE_SECRET:
        rawEnv.SANITY_REVALIDATE_SECRET ??
        'mock_secret_32_characters_long_for_test',
    });
    assertContactEmailConfig(data, isServer);
    return data;
  }

  // --- กรณีที่ 3: พัง (Fail Fast สำหรับ Dev/Prod) ---
  if (isServer) {
    console.error(
      '❌ Missing or invalid environment variables:',
      z.flattenError(parsed.error)
    );
  }
  throw new Error('❌ Environment validation failed');
}

function assertContactEmailConfig(
  data: z.infer<typeof envSchema>,
  isServer: boolean
) {
  if (!isServer || !data.CONTACT_EMAIL_ENABLED) return;

  const contactConfig = z.object({
    RESEND_API_KEY: z.string().trim().min(4).startsWith('re_'),
    CONTACT_EMAIL_FROM: z.email(),
    CONTACT_EMAIL_TO: z.email(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().trim().min(1),
    TURNSTILE_SECRET_KEY: z.string().trim().min(1),
  });
  const result = contactConfig.safeParse(data);
  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path[0])),
    ];
    throw new Error(
      `❌ [FATAL] Missing or invalid contact email configuration: ${fields.join(', ')}`
    );
  }

  // Cloudflare's test keys must never allow a production deployment to send.
  if (data.NODE_ENV === 'production') {
    const testSiteKeys = new Set([
      '1x00000000000000000000AA',
      '2x00000000000000000000AB',
      '1x00000000000000000000BB',
      '2x00000000000000000000BB',
      '3x00000000000000000000FF',
    ]);
    const testSecretKeys = new Set([
      '1x0000000000000000000000000000000AA',
      '2x0000000000000000000000000000000AA',
      '3x0000000000000000000000000000000AA',
    ]);
    if (
      testSiteKeys.has(result.data.NEXT_PUBLIC_TURNSTILE_SITE_KEY) ||
      testSecretKeys.has(result.data.TURNSTILE_SECRET_KEY)
    ) {
      throw new Error(
        '❌ [FATAL] Cloudflare Turnstile test keys cannot be used when production contact email is enabled'
      );
    }
  }
}

export const env = validateEnv();
