# Connect Adako to Gemini

Use Adako inside the Gemini app. Gemini takes a remote MCP server as a **custom app**: you paste one
URL and sign in. Setup takes about a minute.

For Antigravity — the app, the IDE and the `agy` CLI — see [`clients/antigravity.md`](antigravity.md) instead.

## 1. Open the apps settings

On a computer, go to [gemini.google.com/apps](https://gemini.google.com/apps), or open **Settings →
Connected apps** from the bottom of the sidebar.

On a phone: **Menu → Settings & help → Connected apps**.

## 2. Add the custom app

Scroll to **Custom apps** at the bottom, choose **Add a custom app**, and paste the MCP server URL:

```
https://adako.ai/mcp
```

Then click **Next**.

Leave the credential fields under **Advanced features** empty. They are for servers that cannot
register themselves; Adako supports dynamic client registration, so Gemini sets it up on its own.

## 3. Sign in

Complete the Adako authorization screen, then accept Google's notice about third-party MCP servers.
Adako never sends your ad-platform tokens or keys to the client — the connection holds an Adako token
only.

## 4. Use it in a chat

Start a new chat, type `@`, and pick **Adako** so the prompt reaches it:

> “@Adako tell me which ad accounts are connected.”

That call is free and changes nothing.

## No Custom apps section?

Google is rolling custom apps out gradually and lists its own conditions: a personal Google Account
(not a work or school one) with Keep Activity on, in English, in the United States, and 18 or over.
If the section is missing, use Adako from another client — Claude, Claude Code, ChatGPT, Cursor,
Codex, Gemini CLI, Windsurf or VS Code — or over the REST API. The URL is the same everywhere.

## Add the skill (optional)

Paste the contents of `SKILL.md` from this repository into a Gem's instructions. It tells the
assistant to read before writing, confirm before spending, and keep everything it creates paused.
