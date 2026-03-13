# Buffer MCP Server

MCP server for Buffer social media management — create, schedule, and manage posts across all your connected social platforms via Claude.

## Setup

**Requirements:** Node.js >= 20

```bash
npm install
npm run build
```

## Buffer Access Token

1. Go to [buffer.com/developers/apps](https://buffer.com/developers/apps)
2. Create a new app (or use an existing one)
3. Copy your access token

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BUFFER_ACCESS_TOKEN` | Yes | Your Buffer API access token |

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

## Tools (13)

| Tool | Description |
|------|-------------|
| `user_info` | Get authenticated user info |
| `profiles_list` | List all connected social profiles |
| `profiles_get` | Get details for a single profile |
| `posts_create` | Create a new post (queue, schedule, or immediate) |
| `posts_get` | Get a single post by ID |
| `posts_edit` | Edit a pending post |
| `posts_delete` | Delete a pending post |
| `posts_list_pending` | List queued/scheduled posts for a profile |
| `posts_list_sent` | List published posts for a profile |
| `posts_share_now` | Immediately publish a pending post |
| `posts_move_to_top` | Move a post to the top of the queue |
| `schedules_get` | Get a profile's posting schedule |
| `schedules_update` | Update a profile's posting schedule |

## Resources (1)

| URI | Description |
|-----|-------------|
| `buffer://info/api` | API info, rate limits, supported platforms, limitations |

## Limitations

- **No analytics**: Buffer's v1 API does not expose engagement metrics (likes, comments, reach). Use the Buffer dashboard for analytics.
- **No DMs**: Only public posts are supported.
- **Media via URL only**: Attach images by providing a hosted URL, not a file upload.
- **Rate limit**: 60 requests per minute per access token.
