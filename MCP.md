# MCP Documentation

This repository contains MCP-related UI and integration points for model context and tool workflows.

## Relevant locations

- `components/editor/mcp-dashboard.tsx`
- `components/editor/mcp-integration.tsx`
- `components/platform/collaboration/mcp-server-monitor.tsx`

## Implementation notes

- Keep MCP connectivity and tool invocation logic in service-level abstractions where possible.
- Ensure authentication/authorization checks are enforced for MCP-backed operations.
- Document any new MCP servers, endpoints, and required environment variables when added.
