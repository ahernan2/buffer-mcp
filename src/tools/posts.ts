import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { graphql, formatResult } from '../api-client.js';

const POST_FIELDS = `
  id
  text
  status
  via
  shareMode
  schedulingType
  isCustomScheduled
  createdAt
  updatedAt
  dueAt
  sentAt
  sharedNow
  channelId
  channelService
  externalLink
  tags { id name color }
  notes { id text type createdAt }
  assets {
    ... on ImageAsset { id type mimeType source thumbnail image { altText width height } }
    ... on VideoAsset { id type mimeType source thumbnail video { durationMs width height } }
    ... on DocumentAsset { id type mimeType source thumbnail }
  }
  error { message supportUrl }
  allowedActions
`;

export function registerPosts(server: McpServer) {
  server.tool(
    'posts_list',
    'List posts for an organization with optional filters by status, channel, and date range. Supports cursor-based pagination.',
    {
      organization_id: z.string().describe('Organization ID'),
      status: z
        .array(z.enum(['draft', 'needs_approval', 'scheduled', 'sending', 'sent', 'error']))
        .optional()
        .describe('Filter by post status (e.g. ["scheduled", "sent"])'),
      channel_ids: z
        .array(z.string())
        .optional()
        .describe('Filter by channel IDs'),
      due_at_start: z.string().optional().describe('Filter posts due after this ISO 8601 datetime'),
      due_at_end: z.string().optional().describe('Filter posts due before this ISO 8601 datetime'),
      sort_by: z
        .enum(['dueAt', 'createdAt'])
        .optional()
        .describe('Sort field (default: dueAt)'),
      sort_direction: z
        .enum(['asc', 'desc'])
        .optional()
        .describe('Sort direction (default: asc)'),
      first: z.number().int().min(1).max(100).optional().describe('Number of posts to return (default: 20, max: 100)'),
      after: z.string().optional().describe('Cursor for pagination (from pageInfo.endCursor)'),
    },
    async ({ organization_id, status, channel_ids, due_at_start, due_at_end, sort_by, sort_direction, first, after }) => {
      const filter: Record<string, unknown> = {};
      if (status) filter.status = status;
      if (channel_ids) filter.channelIds = channel_ids;
      if (due_at_start || due_at_end) {
        filter.dueAt = {
          ...(due_at_start && { start: due_at_start }),
          ...(due_at_end && { end: due_at_end }),
        };
      }

      const sort = [{
        field: sort_by || 'dueAt',
        direction: sort_direction || 'asc',
      }];

      const variables: Record<string, unknown> = {
        input: {
          organizationId: organization_id,
          filter: Object.keys(filter).length > 0 ? filter : undefined,
          sort,
        },
        first: first || 20,
      };
      if (after) variables.after = after;

      const res = await graphql(
        `query($input: PostsInput!, $first: Int, $after: String) {
          posts(input: $input, first: $first, after: $after) {
            pageInfo { startCursor endCursor hasNextPage }
            edges {
              cursor
              node { ${POST_FIELDS} }
            }
          }
        }`,
        variables,
      );
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'post_get',
    'Get a single post by its ID with full details including assets, tags, notes, and allowed actions.',
    {
      post_id: z.string().describe('Post ID'),
    },
    async ({ post_id }) => {
      const res = await graphql(
        `query($input: PostInput!) {
          post(input: $input) { ${POST_FIELDS} }
        }`,
        { input: { id: post_id } },
      );
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'post_create',
    'Create a new post on a channel. Use mode to control scheduling: "addToQueue" (default queue), "shareNow" (publish immediately), "shareNext" (next in queue), or "customScheduled" (set dueAt).',
    {
      channel_id: z.string().describe('Channel ID to post to (get from channels_list)'),
      text: z.string().describe('Post content text'),
      mode: z
        .enum(['addToQueue', 'shareNow', 'shareNext', 'customScheduled'])
        .optional()
        .describe('Scheduling mode (default: addToQueue)'),
      due_at: z
        .string()
        .optional()
        .describe('ISO 8601 datetime for scheduled post (required when mode is customScheduled)'),
      scheduling_type: z
        .enum(['automatic', 'notification'])
        .optional()
        .describe('Publishing type: "automatic" (Buffer publishes) or "notification" (sends reminder). Default: automatic'),
      image_urls: z
        .array(z.string().url())
        .optional()
        .describe('URLs of images to attach'),
      video_url: z.string().url().optional().describe('URL of a video to attach'),
      tag_ids: z.array(z.string()).optional().describe('Tag IDs to apply to the post'),
    },
    async ({ channel_id, text, mode, due_at, scheduling_type, image_urls, video_url, tag_ids }) => {
      const input: Record<string, unknown> = {
        channelId: channel_id,
        text,
        mode: mode || 'addToQueue',
        schedulingType: scheduling_type || 'automatic',
      };

      if (due_at) input.dueAt = due_at;
      if (tag_ids) input.tagIds = tag_ids;

      const assets: Record<string, unknown> = {};
      if (image_urls?.length) {
        assets.images = image_urls.map((url) => ({ url }));
      }
      if (video_url) {
        assets.videos = [{ url: video_url }];
      }
      if (Object.keys(assets).length > 0) input.assets = assets;

      const res = await graphql(
        `mutation($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess {
              post { ${POST_FIELDS} }
            }
            ... on MutationError {
              message
            }
          }
        }`,
        { input },
      );
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
