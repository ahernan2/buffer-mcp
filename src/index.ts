import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerUser } from './tools/user.js';
import { registerProfiles } from './tools/profiles.js';
import { registerPosts } from './tools/posts.js';
import { registerSchedules } from './tools/schedules.js';
import { registerApiInfoResource } from './resources/api-info.js';

const server = new McpServer({
  name: 'buffer-social',
  version: '1.0.0',
});

// Register all tools (13 total)
registerUser(server);         // 1 tool
registerProfiles(server);     // 2 tools
registerPosts(server);        // 8 tools
registerSchedules(server);    // 2 tools

// Register resources
registerApiInfoResource(server);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
