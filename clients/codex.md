# Connect Adako to Codex

Use Adako directly inside Codex. Setup takes about a minute.

## 1. Add the connection

Open a terminal in any project and run:

```bash
codex mcp add adako --url https://adako.ai/mcp
```

This saves Adako as a Streamable HTTP MCP server.

## 2. Sign in

Run:

```bash
codex mcp login adako
```

Complete the authorization screen in your browser.

## 3. Test it

Start a new Codex session and try asking:

> “Using Adako, tell me which ad accounts are connected.”

## Connection not working?

Confirm that the saved URL ends in `/mcp`, then run `codex mcp login adako` again. The server must
be reachable through public HTTPS and support Streamable HTTP.

To inspect the saved connection, run:

```bash
codex mcp get adako
```

## Use an API key instead

For a headless environment, store an Adako API key in `ADAKO_API_KEY` and run:

```bash
codex mcp add adako --url https://adako.ai/mcp --bearer-token-env-var ADAKO_API_KEY
```

Create API keys at [adako.ai/keys](https://adako.ai/keys). Never paste a key into a prompt or commit
it to your repository.
