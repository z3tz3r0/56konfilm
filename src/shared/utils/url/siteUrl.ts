import { env } from '@shared/config';

/**
 * --- ดึงค่า Base URL สำหรับ Metadata ---
 * ลำดับความสำคัญ: SITE_URL (client) > VERCEL_URL (server) > Localhost
 * การใช้ window.location.origin เป็นการ make sure ว่า
 * หากนำ function นี้ไปใช้ใน client component และไม่ได้กำหนด SITE_URL ใน env
 * จะสามารถ resolve ค่าได้อย่างถูกต้องเสมอ
 */
export function getBaseURL() {
  let url;

  if (env.NEXT_PUBLIC_SITE_URL) {
    url = env.NEXT_PUBLIC_SITE_URL;
  } else if (process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  } else if (typeof window !== 'undefined') {
    url = window.location.origin;
  } else {
    url = `http://localhost:${env.PORT}`;
  }

  return new URL(url);
}
