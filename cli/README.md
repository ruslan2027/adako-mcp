# adako

Adako is an MCP server and REST API for Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn
Ads. This is the command-line client: the same tools an AI assistant calls, as one subprocess.

Zero dependencies, no build step, Node 22+.

```bash
npx @adako/cli login            # paste your ak_live_… key once
npx @adako/cli google list-campaigns --customer-id 1234567890
```

Install it globally if you use it often:

```bash
npm install -g @adako/cli
adako tools
```

## Authentication

Create an API key in the Adako web app (Settings → API keys). A read key can call every read tool; a
write key adds `ads:write`, which write tools and `approve_proposal` need.

```bash
adako login                     # prompts; the key is not echoed on a terminal
adako login --key ak_live_…     # or pass it, e.g. in CI
echo "$ADAKO_KEY" | adako login # or pipe it
```

The key is stored in `$XDG_CONFIG_HOME/adako/config.json`, or `~/.config/adako/config.json` when
that variable is unset, with `0600` permissions. `ADAKO_API_KEY` and `ADAKO_BASE_URL` override the
file; `--key` and `--base-url` override both. `adako logout` deletes the file.

## Commands

| Command                                 | What it does                                            |
| --------------------------------------- | ------------------------------------------------------- |
| `adako tools [--platform google_ads]`   | Every callable tool with its risk and task cost         |
| `adako schema <tool>`                   | One tool's JSON Schema, description and required fields |
| `adako run <tool> [args]`               | Call a tool by its exact name                           |
| `adako <platform> <verb-object> [args]` | Shortcut: `adako meta list-campaigns`                   |
| `adako login` / `adako logout`          | Store or forget the API key                             |

Platforms in the shortcut form: `google`, `meta`, `chatgpt`, `tiktok`, `linkedin` (the `-ads`
suffix is accepted too). `adako google list-campaigns` is exactly `adako run google_list_campaigns`.

## Arguments

Three ways to pass them, and they can be combined — `--json` is the base, plain flags refine it,
`--arg` wins:

```bash
adako run google_update_campaign_budget --arg campaign_id=123 --arg daily_budget=80
adako google update-campaign-budget --campaign-id 123 --daily-budget 80
adako run google_update_campaign_budget --json '{"campaign_id":"123","daily_budget":80}'
```

- Kebab-case flags become snake_case arguments: `--ad-account-id` → `ad_account_id`.
- Values that look like JSON are parsed: `80` is a number, `true` a boolean, `["a","b"]` an array.
  Everything else stays a string.
- **Ids stay strings.** Any key ending in `_id` or `_ids` keeps its leading zeros and full length.
- Money is a decimal in the account currency: `--daily-budget 80`, never `80000000`.
- A repeated flag becomes an array: `--keyword shoes --keyword boots`.
- `--no-something` sets `something: false`.

## Output

Markdown on stdout by default — paste it into a message, a ticket or another prompt. `--raw` prints
the whole JSON envelope instead, which is what you want in a script:

```bash
adako google list-campaigns --raw | jq '.data.campaigns[] | .name'
```

On failure the exit code is non-zero and stderr carries the error code and what to do about it:

```
Error (not_connected): Google Ads is not connected.
  - Ask the user to connect Google Ads at https://adako.ai/connections.
```

Exit codes: `0` success, `1` the call failed, `2` the command line was wrong.

## Safety

Reads run immediately. **Writes become proposals**: the tool validates the change, dry-runs it
against the platform and returns a `proposal_id` — nothing has changed on the ad platform yet.

```
Proposal prp_01J… is waiting. Nothing has changed yet.
Approve: https://adako.ai/approvals/prp_01J…
Or: adako run approve_proposal --arg proposal_id=prp_01J…
```

Approving needs a key with `ads:write`. Created campaigns are always paused. There are no delete
commands; removing negative keywords needs `--confirm-delete`.

## Retries

Pass `--idempotency-key` on anything you might retry — a CI job id or a UUID works well:

```bash
adako run google_update_campaign_budget --arg campaign_id=123 --arg daily_budget=80 \
  --idempotency-key "$GITHUB_RUN_ID"
```

The successful response is cached for 24 hours; replaying the key returns it without running
anything again. Reusing a key with different arguments is refused with `idempotency_mismatch`.

## Full HTTP reference

`https://adako.ai/docs/api` — the envelope, the error codes and the OpenAPI document at
`https://adako.ai/api/v1/openapi.json`.
