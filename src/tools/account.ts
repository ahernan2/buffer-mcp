import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { graphql, formatResult } from '../api-client.js';

export function registerAccount(server: McpServer) {
  server.tool(
    'account_info',
    'Get the authenticated Buffer account: email, name, timezone, connected organizations and their IDs. Call this first to get the organizationId needed by other tools.',
    {},
    async () => {
      const res = await graphql(`{
        account {
          id
          email
          name
          avatar
          timezone
          createdAt
          preferences { timeFormat startOfWeek defaultScheduleOption }
          organizations {
            id
            name
            ownerEmail
            channelCount
            limits {
              channels
              members
              scheduledPosts
              tags
              ideas
            }
          }
        }
      }`);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
