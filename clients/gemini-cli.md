# Gemini CLI

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Gemini CLI takes it as an extension
or as a block in its settings file.

**Untested** — the configuration follows the documented format, but Adako has not been through an
end-to-end check in Gemini CLI yet. Tell [support@adako.ai](mailto:support@adako.ai) if a step does
not match.

## Install the extension

```bash
gemini extensions install https://github.com/ruslan2027/adako-mcp
```

The extension ([`gemini-extension.json`](../gemini-extension.json)) adds the server and loads the
Adako skill as [`GEMINI.md`](../GEMINI.md), so the operating procedure comes with it. Start Gemini
CLI and run `/mcp auth adako` to sign in through the browser. `gemini extensions update adako` pulls
later versions.

## Or add the server with an API key

Use this in a terminal that cannot open a browser. Create an API key at [adako.ai/keys](https://adako.ai/keys) and export it:

```bash
export ADAKO_API_KEY=ak_live_your_key
```

Then add the block to `~/.gemini/settings.json` for every project, or `.gemini/settings.json` inside
one:

```json
{
  "mcpServers": {
    "adako": {
      "httpUrl": "https://adako.ai/mcp",
      "headers": {
        "Authorization": "Bearer ${ADAKO_API_KEY}"
      }
    }
  }
}
```

Keep any servers already in the file; add `adako` beside them.

Start Gemini CLI and run `/mcp` to confirm Adako is listed.

[`clients/gemini-cli/gemini-extension.json`](gemini-cli/gemini-extension.json) is the API-key
variant as an extension manifest: copy it and [`GEMINI.md`](../GEMINI.md) into
`~/.gemini/extensions/adako/` to get the skill with it.

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
- An API key is the right choice for a terminal. Never paste it into a prompt or commit it.
