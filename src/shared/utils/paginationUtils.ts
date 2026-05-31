import { ALLOWED_LIMITS } from '@shared/config';

export function sanitizePaginationLimit(
  limit?: string | number | null | undefined,
  defaultLimit = '6'
) {
  if (!limit) return defaultLimit;

  const stringLimit = limit.toString();

  if (ALLOWED_LIMITS.has(stringLimit)) {
    return stringLimit;
  }

  return defaultLimit;
}
