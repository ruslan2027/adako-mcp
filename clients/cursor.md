# Cursor

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Cursor reads MCP servers from a JSON
file.

This repository is also packaged as a Cursor plugin for the Cursor Marketplace:
[`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json) adds the server and the skills in
[`skills/`](../skills).

## Option A — in Cursor, no files

1. Click **Customize** in the left sidebar, then the **MCPs** tab.
2. Click **New MCP Server**. Cursor opens its configuration file — `C:\Users\<you>\.cursor\mcp.json` on Windows or `/Users/<you>/.cursor/mcp.json` on macOS —
   empty the first time, or holding the servers you already use.
3. Add the `adako` entry inside `"mcpServers"`, beside anything already there, and save (Ctrl+S,
   Cmd+S on a Mac). Entries are separated by commas, so put one after the entry above it.
4. Cursor connects and opens the Adako authorization screen in your browser. After you approve it,
   Adako appears in the MCPs tab with its tools.

Beside your other servers:

```json
"adako": {
  "url": "https://adako.ai/mcp"
}
```

Or, if Adako is your first server, the whole file:

```json
{
  "mcpServers": {
    "adako": {
      "url": "https://adako.ai/mcp"
    }
  }
}
```

Nothing else in the file changes. `install/cursor.mjs` below does the same merge for you and keeps
a backup the first time.

## Option B — the installer

```bash
node install/cursor.mjs            # the home-folder .cursor/mcp.json, every project
node install/cursor.mjs --project  # .cursor/mcp.json, this repository only
```

It merges Adako into the file, keeps every other server exactly as it was, and saves the previous
file as `mcp.json.bak` the first time it changes. Running it twice changes nothing.

```bash
node install/cursor.mjs --key ak_live_your_key   # send an API key instead of signing in
node install/cursor.mjs --dry-run                # print the merged file, write nothing
```

## Option C — by hand

The home-folder file for every project (`C:\Users\<you>\.cursor\mcp.json` on Windows or `/Users/<you>/.cursor/mcp.json` on macOS), or
`.cursor/mcp.json` inside one project:

```json
{
  "mcpServers": {
    "adako": {
      "url": "https://adako.ai/mcp"
    }
  }
}
```

Full file: [`clients/cursor/mcp.json`](cursor/mcp.json).

Cursor runs the OAuth flow on first use. To skip it, use an API key from an environment variable:

```json
{
  "mcpServers": {
    "adako": {
      "url": "https://adako.ai/mcp",
      "headers": {
        "Authorization": "Bearer ${env:ADAKO_API_KEY}"
      }
    }
  }
}
```

Create keys at [adako.ai/keys](https://adako.ai/keys). Never commit one.

Then open **Cursor Settings → MCP** and check that Adako is listed, completing the sign-in if
prompted.

## Add the skills

Copy `skills/adako/SKILL.md` into a project rule, or paste it into **Cursor Settings → Rules**. It
carries the safety contract, the tool-call contract, the tool map and the workflows. The other skills
in `skills/` are focused: one per platform, one per job.

## First run

```
Using Adako, tell me which ad accounts are connected.
```

`start_here` is free. It reports what is connected, which account is primary, its currency and
timezone, and the tasks left this period. If nothing is connected, it hands you the link to
[adako.ai/accounts](https://adako.ai/accounts).

## Notes

- Reads run immediately. Writes come back as a proposal with a diff; nothing changes on the platform
  until you approve it.
- Created campaigns, ad sets and ads are always paused.
- `needs_reauth` means the platform login expired. Reconnect at
  [adako.ai/accounts](https://adako.ai/accounts).
- Cursor signs in with its own `cursor://` callback. If a connection ever fails with
  `web clients require https redirect URIs on non-loopback hosts`, you are on a build of Adako from
  before 2026-09-20 — reconnect once the deployment is current.
