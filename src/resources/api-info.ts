import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const API_INFO = `# Buffer MCP Server — API Info

## API
- GraphQL API at https://api.buffer.com (public beta, launched Feb 2026)
- Authentication: Bearer token via Authorization header
- Content-Type: application/json

## Rate Limits
- 100 requests per 15 minutes (third-party clients)
- 2000 requests per 15 minutes (account-wide across all clients)
- Response headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
- HTTP 429 on exceeded, with retryAfter in seconds

## Supported Platforms
Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, TikTok, Google Business,
Mastodon, YouTube, Threads, Bluesky, Start Page.
Available platforms depend on the user's connected channels.

## Important Limitations
- **No edit posts**: The beta API supports creating and deleting posts, but not editing them.
- **No analytics/engagement**: Metrics like likes, comments, and reach are not available via API.
- **No DMs**: Only public posts are supported.
- **No tag management**: Tags cannot be created, renamed, or deleted via API. They must be created in the Buffer dashboard. See "Tag Discovery" below for how to discover existing tag IDs.
- **Media via URL only**: Images/videos must be pre-hosted. No file upload endpoint yet.
- **Beta status**: API is additive-only; fields are never removed but new ones may appear.

## Typical Workflow
1. \`account_info\` — get your organization ID
2. \`channels_list\` — get connected channels and their IDs
3. \`daily_limits\` — check how many posts you can still make today
4. \`post_create\` — create a post (queue, schedule, or publish immediately)
5. \`posts_list\` — review queued/sent posts with filters
6. \`post_get\` — get full details for a specific post
7. \`post_delete\` — remove a post

## Tag Discovery (First-Time Setup)
Buffer tags can only be created in the dashboard, but you can discover their IDs for API use:
1. \`post_create\` with \`save_to_draft=true\` — create a draft: "Tag Discovery — attach your tags here"
2. Ask the user to open Buffer and attach all their tags to the draft
3. \`tags_discover\` with the draft's post ID — reads back all tags with their IDs
4. Save the tag IDs for use with \`post_create\`'s \`tag_ids\` parameter
5. \`post_delete\` — clean up the discovery draft

## Scheduling Modes
- \`addToQueue\`: Post goes into the channel's queue (published at next scheduled slot)
- \`shareNow\`: Publish immediately
- \`shareNext\`: Move to the front of the queue
- \`customScheduled\`: Schedule for a specific time (provide \`due_at\` ISO 8601 datetime)

## Scheduling Types
- \`automatic\`: Buffer publishes the post directly
- \`notification\`: Buffer sends you a reminder to publish manually (required for some platforms like TikTok)
`;

export function registerApiInfoResource(server: McpServer) {
  server.resource(
    'api-info',
    'buffer://info/api',
    {
      description: 'Buffer API info: rate limits, supported platforms, limitations, scheduling modes, and typical workflow',
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
