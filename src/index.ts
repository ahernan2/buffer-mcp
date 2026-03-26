import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerAccount } from './tools/account.js';
import { registerChannels } from './tools/channels.js';
import { registerPosts } from './tools/posts.js';
import { registerIdeas } from './tools/ideas.js';
import { registerTags } from './tools/tags.js';
import { registerLimits } from './tools/limits.js';
import { registerApiInfoResource } from './resources/api-info.js';

const server = new McpServer({
  name: 'buffer-social',
  version: '2.0.0',
});

// Register all tools (11 total)
registerAccount(server);    // 1 tool:  account_info
registerChannels(server);   // 2 tools: channels_list, channel_get
registerPosts(server);      // 4 tools: posts_list, post_get, post_create, post_delete
registerIdeas(server);      // 1 tool:  idea_create
registerTags(server);       // 1 tool:  tags_discover
registerLimits(server);     // 1 tool:  daily_limits

// Register resources
registerApiInfoResource(server);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
