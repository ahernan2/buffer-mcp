import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerAccount } from './tools/account.js';
import { registerChannels } from './tools/channels.js';
import { registerPosts } from './tools/posts.js';
import { registerIdeas } from './tools/ideas.js';
import { registerApiInfoResource } from './resources/api-info.js';

const server = new McpServer({
  name: 'buffer-social',
  version: '2.0.0',
});

// Register all tools (7 total)
registerAccount(server);    // 1 tool:  account_info
registerChannels(server);   // 2 tools: channels_list, channel_get
registerPosts(server);      // 3 tools: posts_list, post_get, post_create
registerIdeas(server);      // 1 tool:  idea_create

// Register resources
registerApiInfoResource(server);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
