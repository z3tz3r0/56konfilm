import type { HttpPost } from '@shared/lib/http/httpBaseService';

export async function verifyTurnstileToken(
  post: HttpPost,
  secretKey: string,
  token: string,
  ip?: string
): Promise<boolean> {
  const result = await post(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      secret: secretKey,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }
  );

  return Boolean(
    result &&
    typeof result === 'object' &&
    'success' in result &&
    result.success === true
  );
}
