# Cursor

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Cursor reads MCP servers from a JSON
file.

## Option A — the installer

```bash
node install/cursor.mjs            # ~/.cursor/mcp.json, every project
node install/cursor.mjs --project  # .cursor/mcp.json, this repository only
```

It merges Adako into the file, keeps every other server exactly as it was, and saves the previous
file as `mcp.json.bak` the first time it changes. Running it twice changes nothing.

```bash
node install/cursor.mjs --key ak_live_your_key   # send an API key instead of signing in
node install/cursor.mjs --dry-run                # print the merged file, write nothing
```

## Option B — by hand

`~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` inside one:

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
[adako.ai/connections](https://adako.ai/connections).

## Notes

- Reads run immediately. Writes come back as a proposal with a diff; nothing changes on the platform
  until you approve it.
- Created campaigns, ad sets and ads are always paused.
- `needs_reauth` means the platform login expired. Reconnect at
  [adako.ai/connections](https://adako.ai/connections).
