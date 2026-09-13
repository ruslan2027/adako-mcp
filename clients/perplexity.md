# Perplexity

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Perplexity reaches it as a remote
connector.

**Untested** — connector support depends on your Perplexity plan and app version, and Adako has not
been through an end-to-end check there yet. If the steps do not match what you see, write to
[support@adako.ai](mailto:support@adako.ai).

## Add the connector

1. Open the Perplexity desktop app and go to **Settings → Connectors**.
2. Add a connector. Enter the name and the MCP server URL:

   ```
   Adako
   ```

   ```
   https://adako.ai/mcp
   ```

3. Complete the Adako authorization screen in the browser that opens.
4. Start a new thread and switch the Adako connector on for it.

## Test it

Ask:

```
Using Adako, tell me which ad accounts are connected.
```

You should get back what is connected, which account is active, and a few prompts worth trying next.
That call is free and changes nothing.

## If there is no connector setting

Perplexity does not expose MCP connectors on every plan or platform. Two alternatives:

- Use Adako from another client: Claude, Claude Code, ChatGPT, Cursor, Codex, Windsurf or VS Code.
- Use the [REST API](https://adako.ai/docs/api) or the `adako` command line with an API key, and
  paste the result into Perplexity.

## Add the skill

Perplexity has no skill format. Paste the contents of `SKILL.md` from this repository into a Space's
custom instructions. It tells the assistant to read before writing, confirm before spending, and keep
everything it creates paused.

## Notes

- Reads run immediately. Writes come back as a proposal; nothing changes until you approve it in the
  chat or at [adako.ai/approvals](https://adako.ai/approvals).
- Created campaigns, ad sets and ads are always paused.
- Your platform tokens stay with Adako. The connector holds an Adako token only.
