---
name: chatgpt-ads
description: Operating procedure for ChatGPT Ads through Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks about ChatGPT Ads campaigns, ad groups, chat card ads, context hints, spend limits, geo targeting, measurement pixels or review verdicts on that platform, and whenever they ask to launch, pause, resume or edit a ChatGPT Ads campaign. It lists the 23 ChatGPT Ads tools by job, the chat card limits, the account and budget rules, and the order a launch is built in.
license: MIT
---

# ChatGPT Ads with Adako

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill covers ChatGPT Ads: 23
tools behind the `chatgpt_ads` router.

```
chatgpt_ads(action="execute", tool_name="chatgpt_list_campaigns", arguments={"ad_account_id":"acct_123"})
```

`chatgpt_get_performance` is callable by name. Everything else goes through the router.

## Account contract

- Connection is an advertiser API key the user pastes into Adako. **One key is one account.** A
  second account means a second key, pasted separately.
- `ad_account_id` is a string. Omit it to use the primary ChatGPT Ads account.
- Money is a decimal in the account currency. The API takes micros; Adako converts, you never do.
  The platform floor is 1.00 for both the lifetime budget and the daily cap.
- A **lifetime budget is required** on a campaign. A daily cap is optional.
- Geo targeting is a campaign setting, not an ad group setting.

## Tools by job

**See what exists** `chatgpt_get_account` · `chatgpt_get_account_limits` · `chatgpt_list_campaigns` ·
`chatgpt_list_ad_groups` · `chatgpt_list_ads` · `chatgpt_list_pixels` · `chatgpt_get_pixel_settings`

**Measure** `chatgpt_get_performance`

**Resolve and check** `chatgpt_geo_lookup` (free) · `chatgpt_validate_chat_card` (free)

**Create** `chatgpt_launch_ad` · `chatgpt_create_ad_group` · `chatgpt_create_ad`

**Change** `chatgpt_update_campaign` · `chatgpt_update_ad_group` · `chatgpt_update_ad`

**Pause and resume** `chatgpt_pause_campaign` · `chatgpt_resume_campaign` ·
`chatgpt_pause_ad_group` · `chatgpt_resume_ad_group` · `chatgpt_pause_ad` · `chatgpt_resume_ad`

`chatgpt_archive_campaign` is permanent and needs `confirm_delete: true`. Pause instead, unless the
user asks for archiving by name and understands it cannot be undone.

## What the platform sells

- Objectives: `reach`, `clicks`, `conversions`.
- The platform bids towards impressions, clicks or conversions.
- Billing is on impressions or clicks.
- `chatgpt_get_account_limits` returns the live list for that account, plus its currency, timezone
  and review state. Read it before proposing an objective; do not assume from memory.

## The chat card

One ad format. Limits, enforced before anything is created:

| Field                          | Limit                                                          |
| ------------------------------ | -------------------------------------------------------------- |
| Title                          | 3 to 50 characters                                             |
| Body                           | up to 100 characters                                           |
| Destination URL                | https, up to 2048 characters                                   |
| Image                          | square, at least 400 px a side, under 10 MB, jpeg, png or webp |
| Campaign, ad group and ad name | 3 to 1000 characters                                           |
| Context hints                  | up to 20, each up to 100 characters                            |

`chatgpt_validate_chat_card` checks all of it against a real fetch of the image URL. Run it before
proposing the launch; a card that fails review costs a review cycle.

Context hints are free text that steers where the ads appear. They are hints, not keywords, and they
belong to the ad group.

## Launching

1. `chatgpt_get_account` and `chatgpt_get_account_limits`: currency, timezone, account review state,
   what this account may buy.
2. `chatgpt_geo_lookup` for every place name. Without geo targeting the platform chooses where the
   campaign runs, which is rarely what a local advertiser wants.
3. `chatgpt_list_pixels` and `chatgpt_get_pixel_settings` when the objective is conversions. The
   optimisation event must exist on the pixel and have recent traffic.
4. `chatgpt_validate_chat_card` on the copy and image.
5. `validate_campaign_draft` on the `diagnostics` router for a full dry run
   (`platform: "chatgpt_ads"`, `campaign_type: "chat_card"`).
6. `chatgpt_launch_ad` builds campaign, ad group, image upload and one chat card ad, all PAUSED. It
   costs 8 tasks, so say so before calling it.
7. Read back the ids and the review verdict. Approval is not instant; `chatgpt_list_ads` reports the
   verdict and the reason when it arrives.

To extend a campaign that exists: `chatgpt_create_ad_group` (2 tasks) and `chatgpt_create_ad`
(3 tasks), both paused.

## Reading results

`chatgpt_get_performance` reports impressions, clicks, spend, conversions and the ratios derived from
them, broken down by campaign, ad group or ad, next to the equally long period before it. There is no
search-term report and no placement report on this platform; the useful breakdown is by ad, and the
useful diagnosis is the review verdict on `chatgpt_list_ads`.

## Do not

- Do not archive when the user said stop. Pause keeps the history and can be undone.
- Do not put a place name into a write call. Resolve it first.
- Do not propose a conversions objective without a pixel that fires the event.
- Do not paste an API key into the chat. Keys are added in the Adako web app.
