# Windsurf

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Windsurf reaches it through Cascade's
MCP configuration.

**Untested** — the steps below follow Windsurf's documented configuration format, but Adako has not
been through an end-to-end check in Windsurf yet. If something does not match what you see, write to
[support@adako.ai](mailto:support@adako.ai) and we will correct this page.

## Option A — the installer

```bash
node install/windsurf.mjs
```

It merges Adako into `~/.codeium/windsurf/mcp_config.json`, keeps every other server exactly as it
was, and saves the previous file as `mcp_config.json.bak` the first time it changes. Running it twice
changes nothing.

Flags:

```bash
node install/windsurf.mjs --key ak_live_your_key   # send an API key instead of signing in
node install/windsurf.mjs --path /some/other/file  # a different configuration file
node install/windsurf.mjs --dry-run                # print the merged file, write nothing
```

## Option B — by hand

Open **Settings → Cascade → MCP servers**, choose the raw configuration file, and add the `adako`
block beside the servers you already have.

```json
{
  "mcpServers": {
    "adako": {
      "serverUrl": "https://adako.ai/mcp"
    }
  }
}
```

Full file: [`clients/windsurf/mcp_config.json`](windsurf/mcp_config.json).

API-key variant, for a machine with no browser:

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

Create keys at [adako.ai/keys](https://adako.ai/keys). Never paste a key into a prompt or commit it
to a repository.

Save the file, then refresh the server list in the MCP panel.

## Add the skills

Windsurf has no skill format. Paste the contents of `SKILL.md` from this repository into your
workspace rules or global rules. It tells the assistant to read before writing, confirm before
spending, and keep everything it creates paused.

## First run

Ask Cascade:

```
Using Adako, tell me which ad accounts are connected.
```

`start_here` is free and instant. It reports what is connected, which account is primary, its
currency and timezone, and how many tasks remain. If nothing is connected yet, it hands you the link
to [adako.ai/connections](https://adako.ai/connections).

## Notes

- Reads run without a prompt. Writes come back as a proposal with a preview, and nothing changes on
  the ad platform until you approve it.
- Created campaigns, ad sets and ads are always paused.
- If a tool returns `needs_reauth`, the platform login expired. Reconnect at
  [adako.ai/connections](https://adako.ai/connections); no restart needed.
