---
description: Connect Adako and run the first read-only check
argument-hint: '[google|meta|tiktok|linkedin|chatgpt]'
---

# Set up Adako

Walk the user through connecting Adako and prove it works with a read-only call. Adako is an MCP
server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and
LinkedIn Ads.

If `$ARGUMENTS` names a platform, aim the whole walkthrough at that one.

Do this in order, and stop at the first step that is not satisfied.

## 1. Is the server reachable

Call `start_here`. It is free and instant.

- **Tools missing entirely**: the MCP server is not registered. Tell the user to run
  `/plugin install adako@adako`, or `claude mcp add --transport http adako https://adako.ai/mcp`,
  then restart the session and run this command again.
- **An authentication error**: tell them to run `/mcp`, pick **adako**, and sign in through the
  browser. The token is stored by the client; they sign in once.

## 2. Is an ad account connected

Read what `start_here` returned.

- **Nothing connected**: give them https://adako.ai/connections and say which platform to pick.
  Google Ads, Meta Ads, TikTok Ads and LinkedIn Ads sign in through the platform. ChatGPT Ads takes
  an advertiser API key pasted into the web app. Never ask for a password or a token in the chat.
- **Connected but no active account**: call `list_connected_accounts`, show the accounts with their
  currency, and ask which one to work on. Then call `switch_primary_account`.
- **Connected and active**: say which account, its currency and its timezone.

## 3. Prove it works

Run one read. Pick the platform the user connected:

- `google_get_campaign_performance` with `date_range: "last_30_days"`
- `meta_get_campaign_performance`
- `tiktok_get_campaign_performance`
- `linkedin_get_campaign_performance`
- `chatgpt_get_performance`

Report the result as a short table, with the currency on every amount, and the previous period beside
the current one.

## 4. Say what happens next

Three lines, no more:

- Reads run immediately. Writes come back as a proposal with a diff, and nothing changes until the
  user approves it in the chat or at https://adako.ai/approvals.
- Everything Adako creates is paused.
- `get_usage_status` shows the tasks left this period; system, discovery and diagnostic tools are
  free.

Then offer two or three prompts from what is actually connected, for example a wasted-spend review or
a search-term check. Do not run them without being asked.
