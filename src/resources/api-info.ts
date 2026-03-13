import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const API_INFO = `# Buffer MCP Server — API Info

## Rate Limits
- 60 requests per minute per access token
- On 429 response, wait before retrying

## Supported Platforms
Buffer supports posting to: Facebook, Instagram, Twitter/X, LinkedIn, Pinterest, Mastodon, Google Business, TikTok, YouTube, Bluesky, Threads, and Shopify.
Available platforms depend on the user's connected profiles.

## Important Limitations
- **No analytics/engagement endpoints**: Buffer's v1 API only covers post management and scheduling. Metrics like likes, comments, and reach are not available via API.
- **No direct message support**: Buffer only handles public posts.
- **Media uploads**: Buffer accepts media URLs (not file uploads). Images must be hosted somewhere accessible.

## Typical Workflow
1. \`profiles_list\` — get connected profiles and their IDs
2. \`posts_create\` — create a post (goes to queue by default)
3. \`posts_list_pending\` — review queued posts
4. \`posts_share_now\` or \`posts_move_to_top\` — publish immediately or prioritize
5. \`posts_list_sent\` — verify published posts

## Scheduling
- Posts added without \`scheduled_at\` or \`now\` go into the profile's queue
- The queue publishes posts according to the profile's schedule (see \`schedules_get\`)
- Use \`scheduled_at\` with an ISO 8601 datetime to schedule for a specific time
- Use \`now: true\` to bypass the queue and publish immediately
`;

export function registerApiInfoResource(server: McpServer) {
  server.resource(
    'api-info',
    'buffer://info/api',
    {
      description: 'Buffer API info: rate limits, supported platforms, limitations, and typical workflow',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'buffer://info/api',
          mimeType: 'text/markdown',
          text: API_INFO,
        },
      ],
    }),
  );
}
