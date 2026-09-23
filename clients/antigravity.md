# Antigravity

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Antigravity's app, its IDE and the
`agy` CLI share one MCP configuration file, so Adako is added once and appears in all three.

## Add the server

In the desktop app: **Settings → Customizations**, then **Open MCP Config** under *Installed MCP
Servers*. (*Add MCP +* beside it browses Google's store; Adako is a custom server, so it goes in the
config.)

In the IDE: the agent side panel, **…** at the top, then **MCP Servers**.

In the CLI: type `/mcp` in the prompt panel, or open the file yourself — `C:\Users\<you>\.gemini\config\mcp_config.json` on Windows or `/Users/<you>/.gemini/config/mcp_config.json` on macOS (Linux: `/home/<you>/.gemini/config/mcp_config.json`).

```json
{
  "mcpServers": {
    "adako": {
      "serverUrl": "https://adako.ai/mcp"
    }
  }
}
```

Keep any servers already in the file; add `adako` beside them. For one project, use
`.agents/mcp_config.json` in that project instead.

The key is `serverUrl` — `url` and `httpUrl` are the older Gemini CLI spelling.

After saving, press the **refresh** button beside *Installed MCP Servers*: Adako appears in the
list, and clicking it opens the Adako authorization screen in your browser. It then reads
**29 tools enabled**. In the CLI, `/mcp` lists the same thing.

## Without a browser

Create a key at [adako.ai/keys](https://adako.ai/keys) and send it as a header:

```json
{
  "mcpServers": {
    "adako": {
      "serverUrl": "https://adako.ai/mcp",
      "headers": {
        "Authorization": "Bearer ak_live_your_key"
      }
    }
  }
}
```

## Coming from Gemini CLI

Gemini CLI stopped serving free and Pro accounts on 18 June 2026 and now runs only on paid Gemini
and Gemini Enterprise API keys. If you are still on it, the older configuration keeps working —
`httpUrl` inside `.gemini/settings.json`, with the extension manifests
[`gemini-extension.json`](../gemini-extension.json) and
[`gemini-cli/gemini-extension.json`](gemini-cli/gemini-extension.json). To move an existing setup
across, run:

```bash
agy plugin import gemini
```

Project skills move from `.gemini/skills/` to `.agents/skills/`; [`SKILL.md`](../SKILL.md) works in
either.

## First run

```
Using Adako, tell me which ad accounts are connected.
```

`start_here` is free and instant. It reports what is connected, which account is primary, its
currency and timezone, and how many tasks remain.

## Notes

- Reads run immediately. Writes come back as a proposal; nothing changes until you approve it in the
  chat or at [adako.ai/approvals](https://adako.ai/approvals).
- Created campaigns, ad sets and ads are always paused.
- An API key belongs in a terminal, never in a prompt or a commit.
