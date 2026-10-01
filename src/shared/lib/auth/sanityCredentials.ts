import { client, writeClient } from '@/sanity/lib/client';

/**
 * Get credentials from Sanity
 */
export async function getCredentialsFromSanity(): Promise<{
  username: string;
  password: string;
} | null> {
  try {
    const credentials = await client.fetch<{
      username: string;
      password: string;
    } | null>(
      `*[_type == "cmsCredentials" && _id == "cms-credentials"][0] {
        username,
        password
      }`
    );

    return credentials;
  } catch (error) {
    console.error('Error fetching credentials from Sanity:', error);
    return null;
  }
}

/**
 * Update password in Sanity
 */
export async function updatePasswordInSanity(
  newPasswordHash: string
): Promise<void> {
  try {
    await writeClient
      .patch('cms-credentials')
      .set({
        password: newPasswordHash,
        updatedAt: new Date().toISOString(),
      })
      .commit();
  } catch (error) {
    console.error('Error updating password in Sanity:', error);
    throw new Error('Failed to update password');
  }
}
