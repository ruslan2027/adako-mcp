# VS Code (Copilot)

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. VS Code reaches it through its MCP
configuration.

Tell [support@adako.ai](mailto:support@adako.ai) if a step does not match what you see.

## Add the server

`.vscode/mcp.json` in a workspace, or your user `mcp.json`:

```json
{
  "servers": {
    "adako": {
      "type": "http",
      "url": "https://adako.ai/mcp"
    }
  }
}
```

If the file already has servers, add the `adako` entry inside `"servers"` beside them, comma and
all, rather than replacing the file.

Full file, with the API-key variant: [`clients/vscode/mcp.json`](vscode/mcp.json).

VS Code handles the OAuth flow and stores the token. For a machine without a browser, send an API key
from [adako.ai/keys](https://adako.ai/keys) as an `Authorization` header instead.

## Add the skill

Paste the contents of `SKILL.md` from this repository into a `.github/copilot-instructions.md`, or
into the chat instructions for the workspace. It carries the safety contract, the tool-call contract
and the workflows.

## First run

Ask in the chat:

```
Using Adako, tell me which ad accounts are connected.
```

## Notes

- Reads run immediately. Writes come back as a proposal; nothing changes until you approve it.
- Created campaigns, ad sets and ads are always paused.
- `needs_reauth` means the platform login expired. Reconnect at
  [adako.ai/accounts](https://adako.ai/accounts).
