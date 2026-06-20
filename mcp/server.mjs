#!/usr/bin/env node
// mockforge MCP server — exposes the live https://mock.wrapper-agency.com API as
// MCP tools so agents can call it natively. Thin wrapper over /api/v1.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.MOCKFORGE_BASE || "https://mock.wrapper-agency.com";
const server = new McpServer({ name: 'mockforge', version: "1.0.0" });

server.registerTool(
  'generate_mock',
  {
    description: 'Generate realistic fake/test data as JSON (people, emails, UUIDs, companies, addresses, …).',
    inputSchema: {
      type: z.string().describe('Data type, e.g. person, email, name, uuid, company, address'),
      count: z.coerce.number().optional().describe('How many records (1-100)'),
      locale: z.string().optional().describe('Locale, e.g. en, fr, de, ja, es, it, nl, pt_BR'),
      seed: z.string().optional().describe('Seed for deterministic output')
    },
  },
  async (args) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const r = await fetch(`${BASE}/api/v1/mock?${qs.toString()}`);
    return { content: [{ type: "text", text: await r.text() }] };
  }
);

await server.connect(new StdioServerTransport());
