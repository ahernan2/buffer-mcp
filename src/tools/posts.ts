import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { api, formatResult } from '../api-client.js';

export function registerPosts(server: McpServer) {
  server.tool(
    'posts_create',
    'Create a new post in Buffer. Posts go to the queue by default. Set now=true to share immediately, or provide scheduled_at for a specific time.',
    {
      profile_ids: z
        .array(z.string())
        .min(1)
        .describe('Array of profile IDs to post to (get from profiles_list)'),
      text: z.string().describe('The post content text'),
      now: z.boolean().optional().describe('Share immediately instead of adding to queue'),
      scheduled_at: z
        .string()
        .optional()
        .describe('ISO 8601 datetime to schedule the post (e.g. 2025-03-15T14:30:00Z)'),
      shorten: z.boolean().optional().describe('Auto-shorten links in the text (default: true)'),
      media_photo: z.string().url().optional().describe('URL of an image to attach'),
      media_link: z.string().url().optional().describe('URL of a link to attach'),
      media_description: z.string().optional().describe('Description for the media attachment'),
    },
    async ({ profile_ids, text, now, scheduled_at, shorten, media_photo, media_link, media_description }) => {
      const body: Record<string, unknown> = {
        profile_ids,
        text,
      };

      if (now !== undefined) body.now = now;
      if (scheduled_at) body.scheduled_at = Math.floor(new Date(scheduled_at).getTime() / 1000);
      if (shorten !== undefined) body.shorten = shorten;

      const media: Record<string, string> = {};
      if (media_photo) media.photo = media_photo;
      if (media_link) media.link = media_link;
      if (media_description) media.description = media_description;
      if (Object.keys(media).length > 0) body.media = media;

      const res = await api.post('/updates/create.json', body);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'posts_get',
    'Get a single post/update by its ID.',
    {
      update_id: z.string().describe('The Buffer update ID'),
    },
    async ({ update_id }) => {
      const res = await api.get(`/updates/${update_id}.json`);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'posts_edit',
    'Edit an existing pending post. Only pending (queued/scheduled) posts can be edited.',
    {
      update_id: z.string().describe('The Buffer update ID to edit'),
      text: z.string().optional().describe('New post content text'),
      scheduled_at: z
        .string()
        .optional()
        .describe('New ISO 8601 scheduled datetime'),
      now: z.boolean().optional().describe('Share immediately instead of keeping in queue'),
      media_photo: z.string().url().optional().describe('URL of an image to attach'),
      media_link: z.string().url().optional().describe('URL of a link to attach'),
      media_description: z.string().optional().describe('Description for the media attachment'),
    },
    async ({ update_id, text, scheduled_at, now, media_photo, media_link, media_description }) => {
      const body: Record<string, unknown> = {};

      if (text !== undefined) body.text = text;
      if (now !== undefined) body.now = now;
      if (scheduled_at) body.scheduled_at = Math.floor(new Date(scheduled_at).getTime() / 1000);

      const media: Record<string, string> = {};
      if (media_photo) media.photo = media_photo;
      if (media_link) media.link = media_link;
      if (media_description) media.description = media_description;
      if (Object.keys(media).length > 0) body.media = media;

      const res = await api.post(`/updates/${update_id}/update.json`, body);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'posts_delete',
    'Permanently delete a pending post from the Buffer queue.',
    {
      update_id: z.string().describe('The Buffer update ID to delete'),
    },
    async ({ update_id }) => {
      const res = await api.post(`/updates/${update_id}/destroy.json`, {});
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'posts_list_pending',
    'List pending (queued/scheduled) posts for a profile.',
    {
      profile_id: z.string().describe('The Buffer profile ID'),
      page: z.number().int().min(1).optional().describe('Page number (default: 1)'),
      count: z.number().int().min(1).max(100).optional().describe('Posts per page (default: 10, max: 100)'),
    },
    async ({ profile_id, page, count }) => {
      const params = new URLSearchParams();
      if (page !== undefined) params.set('page', String(page));
      if (count !== undefined) params.set('count', String(count));
      const qs = params.toString();
      const path = `/profiles/${profile_id}/updates/pending.json${qs ? `?${qs}` : ''}`;
      const res = await api.get(path);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'posts_list_sent',
    'List sent (published) posts for a profile.',
    {
      profile_id: z.string().describe('The Buffer profile ID'),
      page: z.number().int().min(1).optional().describe('Page number (default: 1)'),
      count: z.number().int().min(1).max(100).optional().describe('Posts per page (default: 10, max: 100)'),
    },
    async ({ profile_id, page, count }) => {
      const params = new URLSearchParams();
      if (page !== undefined) params.set('page', String(page));
      if (count !== undefined) params.set('count', String(count));
      const qs = params.toString();
      const path = `/profiles/${profile_id}/updates/sent.json${qs ? `?${qs}` : ''}`;
      const res = await api.get(path);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'posts_share_now',
    'Immediately share a pending post (skips the queue schedule).',
    {
      update_id: z.string().describe('The Buffer update ID to share now'),
    },
    async ({ update_id }) => {
      const res = await api.post(`/updates/${update_id}/share.json`, {});
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'posts_move_to_top',
    'Move a pending post to the top of the queue so it publishes next.',
    {
      update_id: z.string().describe('The Buffer update ID to move to top'),
    },
    async ({ update_id }) => {
      const res = await api.post(`/updates/${update_id}/move_to_top.json`, {});
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
