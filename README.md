# Buffer MCP Server

MCP server for Buffer social media management — create, schedule, and manage posts across all your connected social platforms via Claude.

Built on Buffer's new GraphQL API (public beta, Feb 2026).

## Setup

**Requirements:** Node.js >= 20

```bash
npm install
npm run build
```

## Buffer Access Token

1. Go to [publish.buffer.com/settings/api](https://publish.buffer.com/settings/api)
2. Click "Generate API Key"
3. Copy your access token

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BUFFER_ACCESS_TOKEN` | Yes | Your Buffer API access token |

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "buffer": {
      "command": "node",
      "args": ["/path/to/buffer-mcp/dist/index.js"],
      "env": {
        "BUFFER_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Usage with Claude Code

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "buffer": {
      "command": "node",
      "args": ["/path/to/buffer-mcp/dist/index.js"],
      "env": {
        "BUFFER_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Tools (7)

| Tool | Description |
|------|-------------|
| `account_info` | Get account, organizations, and their IDs |
| `channels_list` | List all connected social channels for an org |
| `channel_get` | Get details for a single channel |
| `posts_list` | List posts with filters (status, channel, date range) and pagination |
| `post_get` | Get a single post by ID |
| `post_create` | Create a post (queue, schedule, publish now, or publish next) |
| `idea_create` | Save an idea to the Buffer ideas board |

## Resources (1)

| URI | Description |
|-----|-------------|
| `buffer://info/api` | API info, rate limits, supported platforms, limitations |

## Limitations

- **No edit/delete via API**: The beta GraphQL API supports creating posts only. Use the Buffer dashboard to edit or delete.
- **No analytics**: Engagement metrics (likes, comments, reach) are not available via API.
- **No DMs**: Only public posts are supported.
- **Media via URL only**: Attach images/videos by providing a hosted URL. No file upload endpoint yet.
- **Rate limit**: 100 requests per 15 minutes per client.
