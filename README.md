# Adako: ad ops for AI assistants

**アダコ** · [adako.ai](https://adako.ai)

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads.

```
https://adako.ai/mcp
```

Ask "how did my campaigns do last month?" and get an answer from the live account, in the account's
own currency. Ask "raise that budget to 40 a day" and get a proposal you approve before anything
moves. Created campaigns are always paused.

This repository holds the public pieces: the Agent Skills, per-client configuration, one-file
installers, a Claude Code plugin, and the MCP Registry entry. The server itself is hosted.

---

## What it can do

231 tools across five platforms, plus Adako's own.

| Platform     | Tools | What they cover                                                                                                                                                                 |
| ------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Ads   | 70    | Search and Performance Max, keywords and search terms, budgets and bid strategies, assets and extensions, conversion actions, labels, schedules, geo, hourly and device reports |
| Meta Ads     | 43    | Campaigns, ad sets and ads, image, video, carousel and app-install launches, audiences and placements, pixels, lead forms, creative fatigue                                     |
| LinkedIn Ads | 34    | Campaign groups and campaigns, image, video, carousel and text ads, B2B targeting, audience forecasts, conversion rules, engagement metrics                                     |
| TikTok Ads   | 30    | Campaigns, ad groups and in-feed video ads, Spark Ads, video metrics, identities, pixels, creative fatigue                                                                      |
| ChatGPT Ads  | 23    | Chat card campaigns end to end, account limits, pixels, review verdicts                                                                                                         |
| Adako        | 31    | Connections and usage, tool discovery, proposals, diagnostics, monitors, briefs and reports                                                                                     |

Your client does not see 231 entries. It sees 15 tools callable by name plus 13 routers. Each
platform has a read router (`google_ads`, `meta_ads`, `chatgpt_ads`, `tiktok_ads`, `linkedin_ads`)
and a write router beside it (`google_ads_write`, `meta_ads_write`, `chatgpt_ads_write`,
`tiktok_ads_write`, `linkedin_ads_write`). Monitors have `monitoring` and `monitoring_write`, and
`diagnostics` only reads. A read looks like
`google_ads(action="execute", tool_name="google_list_campaigns", arguments={...})`, a change like
`google_ads_write(action="execute", tool_name="google_pause_campaign", arguments={...})`.

Looking things up never changes an account, so an assistant that asks permission per tool can allow
reads once. Every change runs through a `_write` tool, which asks each time and creates a proposal.
`search_tools` finds the right tool from your own wording and returns its exact call line, and it is
free. See [adako.ai/docs/routers](https://adako.ai/docs/routers).

TikTok Ads and LinkedIn Ads are available on request; write to support@adako.ai if you do not see
them on the Connections page.

---

## The safety model

Adako is built so that an assistant can be useful without being dangerous.

| Rule                           | What it means                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reads run immediately          | Performance, structure, search terms, audiences. Nothing to approve.                                                                                       |
| Every write becomes a proposal | You see the object, the before and after values, and the daily cost before anything is sent.                                                               |
| Approval is yours              | Confirm in the chat, or leave proposals in an inbox and approve them at [adako.ai/approvals](https://adako.ai/approvals). Proposals expire after 48 hours. |
| Created objects are paused     | Every campaign, ad set and ad Adako creates starts paused. You enable it yourself.                                                                         |
| Almost nothing deletes         | Eight tools remove something and each needs an explicit confirmation flag. Pause never routes to a delete.                                                 |
| Executed once                  | Each approved proposal carries an idempotency key. Approving twice reports the first result and repeats nothing.                                           |
| Read-back on every write       | The change is confirmed by reading the object back from the platform, not by trusting the response.                                                        |
| Tokens stay server-side        | Your platform tokens are held encrypted by Adako and are never forwarded to the AI client.                                                                 |

Details: [adako.ai/docs/safety](https://adako.ai/docs/safety).

---

## Install — five minutes

Two ways to authenticate:

- **OAuth** — the client opens a browser, you sign in to Adako once. Preferred everywhere it works.
- **API key** — create one at [adako.ai/keys](https://adako.ai/keys), send it as
  `Authorization: Bearer ak_live_…`. Use it for clients that read a static config file.

Pick your client.

### Claude.ai (custom connector)

Pro and Max: **Settings → Connectors → Add custom connector**. Paste the URL, click **Add**, then
**Connect** and sign in.

Team and Enterprise: an owner adds it first under **Organization settings → Connectors → Add**, hovers
**Custom**, chooses **Web**, and pastes the URL. Members then connect it from their own
**Settings → Connectors**.

```
https://adako.ai/mcp
```

The number of custom connectors you can add depends on your Claude plan.

### Claude Desktop

Same **Connectors** settings as Claude.ai — add the custom connector with the URL above, then sign in
when prompted. Desktop shares your Claude account, so a connector added on the web is available here
too. Full guide: [`clients/claude-desktop.md`](clients/claude-desktop.md).

### Claude Code

```bash
claude mcp add --transport http adako https://adako.ai/mcp
```

Then run `/mcp` inside a session and pick **adako** to sign in through the browser.

Add it once for every project with `--scope user`:

```bash
claude mcp add --transport http adako https://adako.ai/mcp --scope user
```

API-key variant, no browser step:

```bash
claude mcp add --transport http adako https://adako.ai/mcp \
  --header "Authorization: Bearer ak_live_your_key"
```

There is also a plugin that installs the server, the skills, a setup command and an operator agent in
one step:

```
/plugin marketplace add ruslan2027/adako-mcp
/plugin install adako@adako
/adako-setup
```

See [`clients/claude-code.md`](clients/claude-code.md) and [`plugin/`](plugin).

### ChatGPT (developer mode)

1. Turn on **Developer mode** under **Settings → Security & login**, then
   [open ChatGPT Plugins](https://chatgpt.com/plugins#settings/Connectors?create-connector=true).
2. Click **+**. Enter `Adako` as the connection name and `https://adako.ai/mcp` as the MCP server URL.
   Add a short description, choose the public endpoint connection option, and click **Create**.
3. Complete authorization if prompted.
4. Start a new conversation, open the tools menu, and select Adako.

Full guide: [`clients/chatgpt.md`](clients/chatgpt.md).

### Cursor

One command, idempotent, and it leaves your other servers alone:

```bash
node install/cursor.mjs            # ~/.cursor/mcp.json
node install/cursor.mjs --project  # .cursor/mcp.json in this repository
```

Or write the file yourself:

```json
{
  "mcpServers": {
    "adako": {
      "url": "https://adako.ai/mcp"
    }
  }
}
```

Full file: [`clients/cursor/mcp.json`](clients/cursor/mcp.json). Guide:
[`clients/cursor.md`](clients/cursor.md).

This repository is also a Cursor plugin, for the Cursor Marketplace:
[`.cursor-plugin/plugin.json`](.cursor-plugin/plugin.json) adds the server and the skills in
[`skills/`](skills).

### Codex CLI

```bash
codex mcp add adako --url https://adako.ai/mcp
codex mcp login adako
```

Or run the installer, which rewrites one table in `~/.codex/config.toml` and leaves the rest of the
file untouched:

```bash
node install/codex.mjs            # API key from $ADAKO_API_KEY
node install/codex.mjs --oauth    # sign in with codex mcp login instead
```

Full file: [`clients/codex/config.toml`](clients/codex/config.toml). Guide:
[`clients/codex.md`](clients/codex.md).

### Windsurf

```bash
node install/windsurf.mjs
```

Or add the block by hand to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "adako": {
      "serverUrl": "https://adako.ai/mcp"
    }
  }
}
```

Full file: [`clients/windsurf/mcp_config.json`](clients/windsurf/mcp_config.json). Guide:
[`clients/windsurf.md`](clients/windsurf.md). **Untested** — the configuration follows the documented
format, but Adako has not been verified in Windsurf yet.

### Gemini CLI

Install the extension from this repository. It adds the server and loads the Adako skill as
[`GEMINI.md`](GEMINI.md):

```bash
gemini extensions install https://github.com/ruslan2027/adako-mcp
```

Then run `/mcp auth adako` inside Gemini CLI to sign in through the browser.

Without a browser, add the server with an API key to `~/.gemini/settings.json` instead:

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

Manifests: [`gemini-extension.json`](gemini-extension.json) (browser sign-in) and
[`clients/gemini-cli/gemini-extension.json`](clients/gemini-cli/gemini-extension.json) (API key).
Guide: [`clients/gemini-cli.md`](clients/gemini-cli.md). **Untested** — the extension packaging has
not been run end to end against Adako yet.

### VS Code (Copilot)

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

VS Code handles the OAuth flow. Full file with the API-key variant:
[`clients/vscode/mcp.json`](clients/vscode/mcp.json). Guide: [`clients/vscode.md`](clients/vscode.md).
**Untested** — configuration follows the documented format.

### Perplexity

Add Adako as a connector in the desktop app: **Settings → Connectors**, then the URL above. Guide:
[`clients/perplexity.md`](clients/perplexity.md). **Untested** — connector support depends on your
plan and app version.

---

## Add the skills

`skills/` holds eleven Agent Skills. `adako` is the operating procedure: the safety contract, the
tool-call contract, the tool map and the workflows. The others are focused: one per platform, one per
job.

| Skill                                                                 | For                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `adako`                                                               | The operating procedure. Start here.                               |
| `google-ads`, `meta-ads`, `tiktok-ads`, `linkedin-ads`, `chatgpt-ads` | One platform each: tools by job, rules, launch order               |
| `launch`                                                              | Creating a campaign safely on any platform                         |
| `performance-review`                                                  | Answering "how are we doing" with numbers that hold up             |
| `optimize`                                                            | What to change after the review, and in what order                 |
| `creative`                                                            | Copy limits and asset specs per platform, and the fatigue playbook |
| `monitoring`                                                          | Monitors, alerts, briefs and reports                               |

- **Claude Code** — install the plugin, or copy `skills/` into `~/.claude/skills/`.
- **claude.ai** — upload `SKILL.md` (the same file as `skills/adako/SKILL.md`) as a skill in settings.
- **Anything else** — paste the contents into your system prompt or project instructions.

The server also ships short instructions on connect, so the skills are optional. They make long
sessions noticeably steadier.

---

## REST API and the command line

The same tools run over HTTP with an API key.

```bash
curl -X POST https://adako.ai/api/v1/tools/google_get_campaign_performance/execute \
  -H "Authorization: Bearer ak_live_your_key" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"date_range": "last_30_days"}}'
```

`GET /api/v1/tools` lists every callable tool. `GET /api/v1/openapi.json` is the machine-readable
contract, which n8n, Zapier and Make can import. Full reference:
[adako.ai/docs/api](https://adako.ai/docs/api).

The `adako` command line wraps the same endpoints for scripts and coding agents:

```bash
npx @adako/cli login
npx @adako/cli google list-campaigns --customer-id 1234567890
npx @adako/cli meta get-campaign-performance --date-range last_30_days --raw
```

Its source is in [`cli/`](cli): plain ESM, no dependencies, Node 22 or newer. The published
package is [`@adako/cli` on npm](https://www.npmjs.com/package/@adako/cli).

---

## Connect your accounts

1. Sign in at [adako.ai](https://adako.ai).
2. Open **Connections** and connect a platform. Google Ads, Meta Ads, TikTok Ads and LinkedIn Ads
   sign in through the platform; ChatGPT Ads takes an advertiser API key. You never hand a password
   or a token to your AI client.
3. Turn on the accounts Adako may work on, and pick the primary for each platform.
4. Back in your assistant, say **"start here"**.

---

## First prompts

Read-only, so nothing can move:

- "Start here."
- "Which ad accounts am I connected to?"
- "How did my Google campaigns do in the last 30 days compared with the 30 before?"
- "Find search terms that spent money and converted nothing last month."
- "Which Meta ad sets are spending without results this week?"
- "Break my best Meta ad set down by placement."
- "Which of my TikTok ads are showing creative fatigue?"
- "What did LinkedIn cost per lead last month, and which job titles did it reach?"
- "Run that wasted-spend check across all my active accounts."

Then, when you want a change:

- "Suggest ten negative keywords from that list and tell me what each one blocks."
- "Pause the campaign that spent the most with no conversions."
- "Raise the daily budget on Brand Search to 40."
- "Draft a paused Search campaign for {product} targeting {city}, 25 a day."
- "Alert me if CPA goes above 80 two days running, and send me a brief every Monday."

Every one of those ends with a proposal you approve or reject.

---

## Pricing

Free includes 1 ad account and 30 tasks a month. Pro ($49/month) covers 5 ad accounts and 600 tasks a
month, Agency ($149/month) 20 accounts and 5,000 tasks, and Enterprise is priced per contract. An
account used in a billing period keeps its place until the period resets. A
task is one billed change to an ad account; reads and connection, usage, proposal, discovery,
diagnostic and resolver tools are free. Monitors, scheduled briefs and generated reports need Pro or above. Details at
[adako.ai/pricing](https://adako.ai/pricing).

## Docs

[adako.ai/docs](https://adako.ai/docs) — quickstart, one page per client, one page per platform, the
tool surface, workflows, monitors, the full tool reference and the REST API.

## Support

[support@adako.ai](mailto:support@adako.ai) · security reports: see [SECURITY.md](SECURITY.md) ·
changes: see [CHANGELOG.md](CHANGELOG.md)

## Licence

The skills and the client configurations in this repository are MIT — see [LICENSE](LICENSE). The
hosted Adako service is proprietary.
