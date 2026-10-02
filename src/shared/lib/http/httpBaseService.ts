export type HttpPost = (
  url: string,
  body: unknown,
  headers?: Record<string, string>
) => Promise<unknown>;

export abstract class HttpBaseService {
  protected static async post(
    url: string,
    body: unknown,
    headers: Record<string, string> = {}
  ): Promise<unknown> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed with status ${response.status}`);
    }

    try {
      return await response.json();
    } catch {
      throw new Error('HTTP response was not valid JSON');
    }
  }
}
