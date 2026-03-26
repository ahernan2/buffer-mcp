import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { graphql, formatResult } from '../api-client.js';

export function registerTags(server: McpServer) {
  server.tool(
    'tags_discover',
    `Discover tags by scanning posts. Buffer's API has no dedicated tags query, so this extracts unique tags from existing posts.

First-time setup workflow:
1. Use post_create with save_to_draft=true to create a draft post (e.g. "Tag Discovery — attach all your tags here")
2. Ask the user to open Buffer, find the draft, and attach every tag they want to use
3. Call this tool with that post's ID to read back all tags with their IDs
4. Save the returned tag IDs for use with post_create's tag_ids parameter
5. Use post_delete to clean up the discovery draft`,
    {
      organization_id: z.string().describe('Organization ID'),
      post_id: z
        .string()
        .optional()
        .describe('Specific post ID to read tags from (e.g. a tag discovery draft). If omitted, scans recent posts.'),
      scan_count: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Number of recent posts to scan when no post_id is given (default: 100)'),
    },
    async ({ organization_id, post_id, scan_count }) => {
      // If a specific post ID is given, just read that post's tags
      if (post_id) {
        const res = await graphql(
          `query($input: PostInput!) {
            post(input: $input) {
              id
              text
              tags { id name color isLocked }
            }
          }`,
          { input: { id: post_id } },
        );
        return { content: [{ type: 'text' as const, text: formatResult(res) }] };
      }

      // Otherwise scan recent posts and extract unique tags
      const res = await graphql(
        `query($input: PostsInput!, $first: Int) {
          posts(input: $input, first: $first) {
            edges {
              node {
                tags { id name color isLocked }
              }
            }
          }
        }`,
        {
          input: {
            organizationId: organization_id,
            sort: [{ field: 'createdAt', direction: 'desc' }],
          },
          first: scan_count || 100,
        },
      );

      // Deduplicate tags across all posts
      if (res.errors?.length) {
        throw new Error(res.errors.map((e) => e.message).join('; '));
      }

      const seen = new Map<string, { id: string; name: string; color: string; isLocked: boolean }>();
      const edges = (res.data as any)?.posts?.edges ?? [];
      for (const edge of edges) {
        for (const tag of edge.node.tags ?? []) {
          if (!seen.has(tag.id)) {
            seen.set(tag.id, tag);
          }
        }
      }

      const result = {
        tags: [...seen.values()],
        postsScanned: edges.length,
        uniqueTagsFound: seen.size,
      };

      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );
}
