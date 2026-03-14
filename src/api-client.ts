import type { GraphQLResponse } from './types.js';

const ACCESS_TOKEN = process.env.BUFFER_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  throw new Error('BUFFER_ACCESS_TOKEN environment variable is required');
}

const API_URL = 'https://api.buffer.com';
const TIMEOUT_MS = 15_000;

export async function graphql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphQLResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      const body = await res.json().catch(() => ({})) as GraphQLResponse;
      const retryAfter = body.errors?.[0]?.extensions?.retryAfter;
      throw new Error(
        `Buffer API rate limit exceeded (100 requests/15 min).${retryAfter ? ` Retry after ${retryAfter}s.` : ''}`,
      );
    }

    return (await res.json()) as GraphQLResponse<T>;
  } finally {
    clearTimeout(timer);
  }
}

export function formatResult<T>(res: GraphQLResponse<T>): string {
  if (res.errors?.length) {
    throw new Error(res.errors.map((e) => e.message).join('; '));
  }
  return JSON.stringify(res.data, null, 2);
}
