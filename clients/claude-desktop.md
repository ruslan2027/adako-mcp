# Claude Desktop

Claude Desktop uses the same connector list as claude.ai. Add Adako once and it is available in both.

## Add the connector

1. Open **Settings → Connectors**.
2. Click **Add custom connector**.
3. Paste the URL:

   ```
   https://adako.ai/mcp
   ```

4. Click **Add**, then **Connect**, and sign in to Adako in the browser window that opens.

On Team and Enterprise plans an owner adds the connector first, under **Organization settings →
Connectors → Add → Custom → Web**. Members then connect it from their own **Settings → Connectors**.

The number of custom connectors you can add depends on your Claude plan.

**Untested** — the steps above follow the documented custom-connector flow, which is shared with
claude.ai. The desktop app has not been through an end-to-end check against Adako yet. If a step does
not match what you see, write to [support@adako.ai](mailto:support@adako.ai) and we will correct this page.

## Add the skill

Upload `SKILL.md` from this repository as a skill in Claude settings. It gives Claude the operating
procedure: read before write, confirm before spend, everything created paused.

## Check it works

Ask:

```
Start here.
```

Claude calls `start_here` and reports your connections, primary accounts, currency and remaining
tasks. If nothing is connected, connect Google Ads or Meta Ads at
[adako.ai/connections](https://adako.ai/connections) and ask again.

## What to expect

- Reads answer straight away.
- A change request comes back as a proposal with the object, the before and after values, and the
  daily cost. Nothing is sent to the ad platform until you approve it.
- Proposals also appear at [adako.ai/approvals](https://adako.ai/approvals) and expire after 48 hours.
- Anything Adako creates is paused.

## Troubleshooting

| What you see                       | What to do                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| The connector will not connect     | Check you are signed in to Adako in the same browser, then retry **Connect**.                     |
| No Adako tools in the conversation | Open the connector list in the chat composer and switch Adako on for that conversation.           |
| `needs_reauth`                     | That platform's login expired. Reconnect at [adako.ai/connections](https://adako.ai/connections). |
| `quota_exceeded`                   | The month's tasks are used up. See [adako.ai/pricing](https://adako.ai/pricing).                  |
