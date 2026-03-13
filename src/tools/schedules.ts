import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { api, formatResult } from '../api-client.js';

export function registerSchedules(server: McpServer) {
  server.tool(
    'schedules_get',
    'Get the posting schedule for a profile (which days and times posts are sent).',
    {
      profile_id: z.string().describe('The Buffer profile ID'),
    },
    async ({ profile_id }) => {
      const res = await api.get(`/profiles/${profile_id}/schedules.json`);
      return { content: [{ type: 'text' as const, text: formatResult(res) }] };
    },
  );

  server.tool(
    'schedules_update',
    'Update the posting schedule for a profile. Each schedule entry has days (mon,tue,wed,thu,fri,sat,sun) and times (HH:MM format).',
    {
      profile_id: z.string().describe('The Buffer profile ID'),
      schedules: z.array(
        z.object({
          days: z
            .array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']))
            .min(1)
            .describe('Days of the week'),
          times: z
            .array(z.string().regex(/^\d{2}:\d{2}$/))
            .min(1)
            .describe('Posting times in HH:MM format'),
        }),
      ).min(1).describe('Array of schedule entries'),
    },
    async ({ profile_id, schedules }) => {
      // Manually build URLSearchParams for the nested schedules format
      // Buffer expects: schedules[0][days][]=mon&schedules[0][days][]=tue&schedules[0][times][]=09:00
      const params = new URLSearchParams();

      schedules.forEach((schedule, i) => {
        schedule.days.forEach((day) => {
          params.append(`schedules[${i}][days][]`, day);
        });
        schedule.times.forEach((time) => {
          params.append(`schedules[${i}][times][]`, time);
        });
      });

      const ACCESS_TOKEN = process.env.BUFFER_ACCESS_TOKEN!;
      const url = `https://api.bufferapp.com/1/profiles/${profile_id}/schedules/update.json?access_token=${ACCESS_TOKEN}`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
          signal: controller.signal,
        });

        if (response.status === 429) {
          throw new Error('Buffer API rate limit exceeded (60 requests/minute). Wait a moment and retry.');
        }

        const data = await response.json().catch(() => ({}));
        const res = { ok: response.ok, status: response.status, data };
        return { content: [{ type: 'text' as const, text: formatResult(res) }] };
      } finally {
        clearTimeout(timer);
      }
    },
  );
}
