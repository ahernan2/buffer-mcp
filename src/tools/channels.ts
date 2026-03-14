import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { graphql, formatResult } from '../api-client.js';

export function registerChannels(server: McpServer) {
  server.tool(
    'channels_list',
    'List all connected social media channels for an organization. Returns channel IDs needed by post_create and posts_list.',
    {
      organization_id: z.string().describe('Organization ID (get from account_info)'),
    },
    async ({ organization_id }) => {
      const res = await graphql(
        `query($input: ChannelsInput!) {
          channels(input: $input) {
            id
            name
            displayName
            service
            type
            avatar
            isDisconnected
            isLocked
            isQueuePaused
            timezone
            externalLink
            postingSchedule { day times paused }
          }
        }`,
        { input: { organizationId: organization_id } },
      );
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'channel_get',
    'Get detailed info for a single channel including posting schedule, metadata, and queue status.',
    {
      channel_id: z.string().describe('Channel ID'),
    },
    async ({ channel_id }) => {
      const res = await graphql(
        `query($input: ChannelInput!) {
          channel(input: $input) {
            id
            name
            displayName
            service
            type
            avatar
            isDisconnected
            isLocked
            isQueuePaused
            timezone
            externalLink
            postingSchedule { day times paused }
            postingGoal { goal sentCount scheduledCount status periodStart periodEnd }
            linkShortening { isEnabled config { domain name } }
          }
        }`,
        { input: { id: channel_id } },
      );
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
