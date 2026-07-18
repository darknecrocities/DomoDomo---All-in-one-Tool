# MCP Server — Security Hardening & Verification

The MCP server exposes powerful host tools (shell exec, file read/write, desktop
RPA: keyboard/mouse/screen/clipboard). It must **never** be reachable from the LAN
or from arbitrary websites. This document describes the hardening applied and how
to replicate/verify it locally.

## What changed

Three layers of defense, all in `mcp-server/src/index.ts`:

1. **Loopback bind** — `app.listen(PORT, MCP_HOST)` with `MCP_HOST` defaulting to
   `127.0.0.1` (was `0.0.0.0`). The server is no longer reachable from the LAN.
2. **Strict CORS allow-list** — `MCP_ALLOWED_ORIGINS` (default
   `http://localhost:5173,http://127.0.0.1:5173`). Cross-origin `EventSource`/`fetch`
   from drive-by websites is rejected.
3. **Optional shared-secret token** — `MCP_AUTH_TOKEN`. When set, every `/sse` and
   `/message` request must present it via `?token=` (EventSource-friendly),
   `Authorization: Bearer <token>`, or `x-mcp-token`. When unset the server runs but
   prints a loud warning.

The web client sends the token from `localStorage` key `domodomo_mcp_token`
(`src/utils/mcpClient.ts`, `src/tools/ai/AIDomoAgentHub.tsx`). Because the browser
`EventSource` API cannot set headers, the token travels as a `?token=` query param.

Configuration reference: [`.env.example`](./.env.example).

## Run it

```bash
cd mcp-server
npm install        # first time only
npm run build      # compiles src -> dist
npm start          # runs dist/index.js on 127.0.0.1:3001
```

Optional environment variables:

```bash
MCP_HOST=127.0.0.1                                   # bind interface (keep loopback)
MCP_PORT=3001                                        # port
MCP_ALLOWED_ORIGINS=http://localhost:5173            # comma-separated CORS allow-list
MCP_AUTH_TOKEN=<random-secret>                       # require a shared secret
```

Generate a token:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Verify in the UI

1. Start the MCP server (`npm start` above). The frontend auto-connects to
   `http://localhost:3001/sse`.
2. Open the app (`http://localhost:5173`) and go to **Domo Agent Hub** (`/tool/domo-agent-hub`)
   or **Auto-Pilot Workspace** (`/tool/auto-pilot`).
3. Expected: the MCP status shows **connected** and lists the host tools
   (Auto-Pilot shows *"Local Server Connected (3001)"*; the Agent Hub's MCP panel
   lists the tools). `20` tools should load.

### Token mode (UI)

1. Restart the server with a token: `MCP_AUTH_TOKEN=testsecret npm start`.
2. In the browser DevTools console:
   ```js
   localStorage.setItem('domodomo_mcp_token', 'testsecret'); location.reload();
   ```
   → connects normally (token sent as `?token=`).
3. Remove it: `localStorage.removeItem('domodomo_mcp_token'); location.reload();`
   → the server returns **401** and the UI shows MCP **offline**.

## Verify from the CLI (no browser)

With the server running on `127.0.0.1:3001`:

```bash
# Bound to loopback only (should show 127.0.0.1, never 0.0.0.0):
netstat -ano | grep ":3001"

# CORS: disallowed origin is rejected (no Access-Control-Allow-Origin):
curl -s -o /dev/null -w "%{http_code}\n" -H "Origin: http://evil.com" \
  http://localhost:3001/sse            # -> 500 (rejected)

# Token mode (start server with MCP_AUTH_TOKEN=testsecret):
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/sse            # -> 401
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3001/sse?token=testsecret"  # -> stream
```

### Full handshake (persistent SSE stream held open)

The `/message` endpoint routes its JSON-RPC reply back through the **open** SSE
stream, so the stream must stay connected while POSTing:

```bash
# 1. Open the SSE stream in the background and capture the session id:
curl -s -N -H "Origin: http://localhost:5173" http://localhost:3001/sse > /tmp/sse.out &
sleep 2
SID=$(grep -m1 sessionId= /tmp/sse.out | sed 's#.*sessionId=##' | tr -d '\r')

# 2. initialize + list tools (both return 202 Accepted; results arrive on the stream):
curl -s -X POST -H "Origin: http://localhost:5173" -H "Content-Type: application/json" \
  "http://localhost:3001/message?sessionId=$SID" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"cli","version":"1.0"}},"id":1}'
curl -s -X POST -H "Origin: http://localhost:5173" -H "Content-Type: application/json" \
  "http://localhost:3001/message?sessionId=$SID" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}'

# 3. Inspect the stream — you should see the serverInfo and the 20-tool list:
grep "data:" /tmp/sse.out
```

> A one-shot `curl` that closes the stream before POSTing will get
> `SSE connection not established (500)` — that is a client artifact, not a server
> bug. The browser's `EventSource` keeps the stream open, so the UI works.

## Verified results

| Check | Expected | Result |
|---|---|---|
| Bind interface | `127.0.0.1` only | ✅ `netstat` shows loopback only |
| `/sse` no token (token mode) | 401 | ✅ |
| `/message` POST no token (token mode) | 401 | ✅ |
| Disallowed `Origin` | CORS reject | ✅ 500, no `Access-Control-Allow-Origin` |
| Allowed origin + valid token | SSE stream | ✅ |
| Full handshake (persistent stream) | initialize + 20 tools | ✅ |
| Default no-token mode | connects + warns | ✅ |

## Residual risk

With no `MCP_AUTH_TOKEN` set, other **local** processes on the same machine can still
reach the server (loopback + CORS only stop the network and the browser). Set
`MCP_AUTH_TOKEN` (and the matching `domodomo_mcp_token` in the app) to require a
shared secret. Command injection and path traversal inside individual tool
implementations are tracked separately and are **not** addressed by this change.
