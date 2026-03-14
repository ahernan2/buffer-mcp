import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { graphql, formatResult } from '../api-client.js';

export function registerIdeas(server: McpServer) {
  server.tool(
    'idea_create',
    'Save an idea to the Buffer ideas board for later use. Ideas can have text, images, tags, and target services.',
    {
      organization_id: z.string().describe('Organization ID'),
      title: z.string().optional().describe('Idea title'),
      text: z.string().optional().describe('Idea body text'),
      services: z
        .array(
          z.enum([
            'instagram', 'facebook', 'twitter', 'linkedin', 'pinterest',
            'tiktok', 'googlebusiness', 'mastodon', 'youtube', 'threads', 'bluesky',
          ]),
        )
        .optional()
        .describe('Target social platforms for this idea'),
      image_url: z.string().url().optional().describe('URL of an image to attach'),
    },
    async ({ organization_id, title, text, services, image_url }) => {
      const content: Record<string, unknown> = {};
      if (title) content.title = title;
      if (text) content.text = text;
      if (services) content.services = services;
      if (image_url) {
        content.media = [{ url: image_url, type: 'image' }];
      }

      const res = await graphql(
        `mutation($input: CreateIdeaInput!) {
          createIdea(input: $input) {
            ... on Idea {
              id
              content { title text services }
              createdAt
            }
            ... on IdeaResponse {
              idea { id content { title text services } createdAt }
            }
            ... on MutationError {
              message
            }
          }
        }`,
        { input: { organizationId: organization_id, content } },
      );
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );
}
