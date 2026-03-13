import type { BufferApiError } from './types.js';

const ACCESS_TOKEN = process.env.BUFFER_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  throw new Error('BUFFER_ACCESS_TOKEN environment variable is required');
}

const BASE_URL = 'https://api.bufferapp.com/1';
const TIMEOUT_MS = 15_000;

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

/**
 * Flatten a nested object into URLSearchParams for form-encoded POSTs.
 * Handles arrays: profile_ids[0]=abc&profile_ids[1]=def
 * Handles nested objects: media[photo]=url
 */
export function flattenToForm(obj: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();

  function flatten(value: unknown, prefix: string): void {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        flatten(item, `${prefix}[${i}]`);
      });
    } else if (typeof value === 'object') {
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        flatten(val, `${prefix}[${key}]`);
      }
    } else {
      params.append(prefix, String(value));
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    flatten(value, key);
  }

  return params;
}

async function request<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${path}${separator}access_token=${ACCESS_TOKEN}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const init: RequestInit = {
      method,
      signal: controller.signal,
    };

    if (method === 'POST' && body) {
      init.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      init.body = flattenToForm(body).toString();
    }

    const res = await fetch(url, init);

    if (res.status === 429) {
      throw new Error(
        'Buffer API rate limit exceeded (60 requests/minute). Wait a moment and retry.',
      );
    }

    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T = unknown>(path: string) => request<T>('GET', path),
  post: <T = unknown>(path: string, body: Record<string, unknown>) =>
    request<T>('POST', path, body),
};

export function formatResult(res: ApiResponse): string {
  if (res.ok) {
    return JSON.stringify(res.data, null, 2);
  }
  const errData = res.data as BufferApiError;
  const errMsg = errData?.error || errData?.message || `HTTP ${res.status}`;
  throw new Error(errMsg);
}
