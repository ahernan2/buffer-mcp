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

## Tools (10)

| Tool | Description |
|------|-------------|
| `account_info` | Get account, organizations, and their IDs |
| `channels_list` | List all connected social channels for an org |
| `channel_get` | Get details for a single channel |
| `posts_list` | List posts with filters (status, channel, date range) and pagination |
| `post_get` | Get a single post by ID |
| `post_create` | Create a post (queue, schedule, publish now, draft, or publish next) |
| `post_delete` | Delete a post by ID |
| `idea_create` | Save an idea to the Buffer ideas board |
| `tags_discover` | Discover tag IDs by reading tags from posts |
| `daily_limits` | Check daily posting limits per channel |

## Resources (1)

| URI | Description |
|-----|-------------|
| `buffer://info/api` | API info, rate limits, supported platforms, limitations |

## First-Time Setup: Discovering Tags

Buffer's API doesn't have a way to list tags directly — tags must be created in the Buffer dashboard. To discover your tag IDs for use with `post_create`:

1. **Create a discovery draft:**
   > "Create a draft post called 'Tag Discovery — attach your tags here'"

   The AI calls `post_create` with `save_to_draft=true`.

2. **Attach your tags:** Open Buffer, find the draft, and attach every tag you want available to the AI.

3. **Tell the AI you're done:** The AI calls `tags_discover` with the draft's post ID and reads back all tag names, colors, and IDs.

4. **Clean up:** The AI deletes the discovery draft with `post_delete`.

After this one-time setup, the AI can tag every post it creates using the discovered IDs.

## Common Workflows

**Queue a post to LinkedIn:**
> "Post this to my LinkedIn: [content]"

**Schedule a week of content:**
> "Create 5 LinkedIn posts from my content library, scheduled for next week"

**Check what's queued:**
> "What posts do I have scheduled across all channels?"

**Save an idea for later:**
> "Save this as an idea for Instagram: [concept]"

**Check posting limits before batch creation:**
> "How many more posts can I make today on each channel?"

## Limitations

- **No edit via API**: Posts can be created and deleted, but not edited. Use the Buffer dashboard to edit.
- **No analytics**: Engagement metrics (likes, comments, reach) are not available via API.
- **No DMs**: Only public posts are supported.
- **No tag creation via API**: Tags must be created in the Buffer dashboard. Use the tag discovery workflow above to find their IDs.
- **Media via URL only**: Attach images/videos by providing a hosted URL. No file upload endpoint yet.
- **Rate limit**: 100 requests per 15 minutes per client.
