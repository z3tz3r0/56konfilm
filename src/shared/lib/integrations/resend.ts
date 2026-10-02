import type { HttpPost } from '@shared/lib/http/httpBaseService';

export type ResendMessage = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export async function sendResendEmail(
  post: HttpPost,
  apiKey: string,
  message: ResendMessage
): Promise<string | null> {
  const result = await post(
    'https://api.resend.com/emails',
    {
      from: message.from,
      to: [message.to],
      reply_to: message.replyTo,
      subject: message.subject,
      text: message.text,
    },
    {
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': '56konfilm-contact',
    }
  );

  if (
    !result ||
    typeof result !== 'object' ||
    !('id' in result) ||
    typeof result.id !== 'string' ||
    !result.id.trim()
  ) {
    return null;
  }

  return result.id;
}
