# Claude Code

Two ways in: add the server on its own, or install the plugin, which adds the server, the skills, a
setup command and an operator agent together.

## Option A — add the server

```bash
claude mcp add --transport http adako https://adako.ai/mcp
```

Start a session, run `/mcp`, choose **adako**, and sign in in the browser. The token is stored by
Claude Code; you sign in once.

Scope it so every project sees it:

```bash
claude mcp add --transport http adako https://adako.ai/mcp --scope user
```

Scopes are `local` (this project, just you — the default), `project` (checked into `.mcp.json` and
shared with the repo) and `user` (every project on this machine).

### API key instead of OAuth

Create a key at [adako.ai/keys](https://adako.ai/keys), then:

```bash
claude mcp add --transport http adako https://adako.ai/mcp \
  --header "Authorization: Bearer ak_live_your_key"
```

Use this for CI, containers, or any machine without a browser.

### By file

Project scope writes `.mcp.json` at the repository root. You can also write it by hand:

```json
{
  "mcpServers": {
    "adako": {
      "type": "http",
      "url": "https://adako.ai/mcp",
      "headers": {
        "Authorization": "Bearer ${ADAKO_API_KEY}"
      }
    }
  }
}
```

`${ADAKO_API_KEY}` is expanded from the environment, so the key never lands in the repository. Drop
the `headers` block to use OAuth instead.

### Check and remove

```bash
claude mcp list
claude mcp get adako
claude mcp remove adako
```

## Option B — install the plugin

The plugin registers the remote server and bundles all eleven skills, so a fresh machine needs one
command.

```
/plugin marketplace add ruslan2027/adako-mcp
/plugin install adako@adako
```

Then run `/mcp` and sign in.

The plugin lives in [`plugin/`](../plugin) and contains:

- `.claude-plugin/plugin.json` and `.mcp.json` — the manifest and the remote MCP server
- `skills/` — all eleven skills, including `adako` and its tool cheatsheet
- `commands/adako-setup.md` — `/adako-setup` walks you through connecting and the first read
- `agents/adako-operator.md` — an operator persona for longer ad-ops sessions

After installing, run:

```
/adako-setup
```

## First run

```
> start here
```

`start_here` reports what is connected, which account is primary, its currency and timezone, and how
many tasks remain. If nothing is connected yet, it hands you the link to
[adako.ai/connections](https://adako.ai/connections).

## Notes

- Reading tools such as `google_ads` never change an account, so allow them once when Claude Code
  asks. Changes run through the `_write` tools (`google_ads_write`, …), which ask each time and come
  back as a proposal with a preview; Claude Code shows it and waits for you.
- Created campaigns, ad sets and ads are always paused.
- If a tool returns `needs_reauth`, the platform login expired. Reconnect at
  [adako.ai/connections](https://adako.ai/connections); no restart needed.
