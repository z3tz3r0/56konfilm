import '@testing-library/jest-dom/vitest';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Ensure required variables for tests if not in .env.local
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'test-project';
process.env.NEXT_PUBLIC_SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
process.env.NEXT_PUBLIC_SANITY_API_VERSION =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-12';
// Ensure BASE_URL is a valid URL for env validation (may be invalid in .env.local)
try {
  if (process.env.BASE_URL) new URL(process.env.BASE_URL);
} catch {
  process.env.BASE_URL = 'http://localhost:3000';
}
