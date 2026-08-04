import { isAxiosError } from 'axios';

import type { Envelope } from '@/api/client';

/**
 * Extracts the backend's own `message` from a failed mutation's error
 * (the standard `{success, status_code, data, message, errors}` envelope -
 * see docs/API_STANDARDS.md), falling back to a generic string when the
 * error isn't a recognizable API response (network failure, unexpected
 * shape). Use this instead of a hardcoded "Could not save. Try again." so a
 * specific validation reason (e.g. "Saved amount cannot exceed target")
 * actually reaches the user instead of being silently discarded.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as Envelope<unknown> | undefined)?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
}
