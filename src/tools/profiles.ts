import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { api, formatResult } from '../api-client.js';

export function registerProfiles(server: McpServer) {
  server.tool(
    'profiles_list',
    'List all connected social media profiles. Call this first to get profile IDs needed by other tools.',
    {},
    async () => {
      const res = await api.get('/profiles.json');
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'profiles_get',
    'Get details for a single social media profile including schedule and post counts.',
    {
      profile_id: z.string().describe('The Buffer profile ID'),
    },
    async ({ profile_id }) => {
      const res = await api.get(`/profiles/${profile_id}.json`);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
