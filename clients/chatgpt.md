# Connect Adako to ChatGPT

Use Adako directly inside ChatGPT. Setup takes about a minute.

## 1. Open ChatGPT Plugins

Turn on **Developer mode** under **Settings → Security & login**, then open the plugin settings:

[Open ChatGPT Plugins](https://chatgpt.com/plugins#settings/Connectors?create-connector=true)

## 2. Add the connection

Click the **+** button. Copy and paste these values:

Connection name:

```
Adako
```

MCP server URL:

```
https://adako.ai/mcp
```

Then:

- Add a short description for Adako.
- Choose the public endpoint connection option.
- Click **Create**.

## 3. Sign in

Complete the authorization screen if prompted. Then start a new conversation, open the tools menu,
and select Adako.

## 4. Test the connection

Try asking:

> “Using Adako, tell me which ad accounts are connected.”

## Can’t find Developer mode?

Developer mode availability depends on your ChatGPT account and workspace policy. If you use a
managed workspace, ask your administrator to enable custom plugins.

## Connection not working?

Confirm that you copied the complete URL ending in `/mcp`. The server must be reachable through public
HTTPS and support Streamable HTTP.

## Add the skill (optional)

ChatGPT has no skill format. Paste the contents of `SKILL.md` from this repository into a custom
instruction or a project instruction. It tells ChatGPT to read before writing, confirm before spending,
and keep everything it creates paused.
