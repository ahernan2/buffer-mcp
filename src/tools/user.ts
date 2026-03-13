import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { api, formatResult } from '../api-client.js';

export function registerUser(server: McpServer) {
  server.tool(
    'user_info',
    'Get the authenticated Buffer user info: name, plan, timezone, and usage limits.',
    {},
    async () => {
      const res = await api.get('/user.json');
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
