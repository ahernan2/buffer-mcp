import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { graphql, formatResult } from '../api-client.js';

export function registerLimits(server: McpServer) {
  server.tool(
    'daily_limits',
    'Get daily posting limit status for channels — how many posts sent, scheduled, and remaining today. Useful before batch-creating posts.',
    {
      channel_ids: z
        .array(z.string())
        .describe('Channel IDs to check (get from channels_list)'),
      date: z
        .string()
        .optional()
        .describe('ISO 8601 date to check (default: today)'),
    },
    async ({ channel_ids, date }) => {
      const variables: Record<string, unknown> = {
        input: { channelIds: channel_ids },
      };
      if (date) (variables.input as any).date = date;

      const res = await graphql(
        `query($input: DailyPostingLimitsInput!) {
          dailyPostingLimits(input: $input) {
            channelId
            sent
            scheduled
            limit
            isAtLimit
          }
        }`,
        variables,
      );
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
