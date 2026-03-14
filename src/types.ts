// Buffer GraphQL API types

export type Service =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'pinterest'
  | 'tiktok'
  | 'googlebusiness'
  | 'startPage'
  | 'mastodon'
  | 'youtube'
  | 'threads'
  | 'bluesky';

export type PostStatus = 'draft' | 'needs_approval' | 'scheduled' | 'sending' | 'sent' | 'error';

export type ShareMode = 'addToQueue' | 'shareNow' | 'shareNext' | 'customScheduled' | 'recommendedTime';

export type SchedulingType = 'automatic' | 'notification';

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      retryAfter?: number;
    };
  }>;
}
