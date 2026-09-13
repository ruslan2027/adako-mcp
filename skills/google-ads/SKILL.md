---
name: google-ads
description: Operating procedure for Google Ads through Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks about Google Ads campaigns, ad groups, keywords, search terms, quality score, budgets, bid strategies, Performance Max, assets and extensions, conversion actions, labels, ad schedules or device bid modifiers, and whenever they ask to create, pause, re-budget or otherwise change a Google Ads account. It lists the 70 Google tools by job, the order a campaign must be built in, the resolvers that have to run before any write, and the platform rules that cause most rejections.
license: MIT
---

# Google Ads with Adako

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill covers Google Ads: 70
tools behind the `google_ads` router.

Call every one of them as:

```
google_ads(action="execute", tool_name="google_list_campaigns", arguments={"customer_id":"1234567890"})
```

`google_get_campaign_performance` is the exception: it is callable by name. `list_tools` on the
router is free if you want the full list.

## Account contract

- `customer_id` is a string with no dashes. Omit it to use the primary account.
- Manager (MCC) accounts appear in `list_connected_accounts` but cannot be worked on. Pick the
  account that holds the campaigns.
- Money is a decimal in the account currency. Adako converts to micros; you never do.
- Dates are `YYYY-MM-DD` or a preset (`last_7_days`, `last_30_days`, `last_month`, and so on).

## Tools by job

**See what exists** `google_list_campaigns` · `google_get_campaign_structure` ·
`google_get_ad_creative` · `google_list_asset_groups` · `google_get_campaign_targeting` ·
`google_list_conversion_actions` · `google_list_labels` · `google_list_bidding_strategies` ·
`google_list_assets` · `google_get_ad_schedule`

**Measure** `google_get_campaign_performance` · `google_get_ad_group_performance` ·
`google_get_ad_performance` · `google_get_keyword_performance` · `google_get_asset_performance` ·
`google_get_asset_group_performance` · `google_get_device_performance` · `google_get_geo_performance` ·
`google_get_hourly_performance` · `google_get_conversion_action_performance`

**Diagnose** `google_analyze_search_terms` · `google_analyze_wasted_spend` ·
`google_explain_performance_anomaly` · `google_optimize_budget_allocation` ·
`google_get_benchmark_context`

**Resolve before writing** `google_resolve_locations` (free) · `google_list_languages` (free) ·
`google_validate_ad_copy` (free) · `google_validate_and_prepare_assets` (free) ·
`google_research_keywords` · `google_search_audiences`

**Create** `google_create_search_campaign` · `google_create_responsive_search_ad` ·
`google_create_pmax_campaign` · `google_create_conversion_action`

**Change** `google_update_campaign_budget` · `google_update_campaign` ·
`google_update_campaign_networks` · `google_update_campaign_locations` ·
`google_update_campaign_languages` · `google_update_bid_strategy` · `google_set_ad_schedule` ·
`google_set_device_bid_modifiers` · `google_update_conversion_action` · `google_update_keyword` ·
`google_bulk_update_keyword_status` · `google_bulk_update_keyword_bids` · `google_add_keywords` ·
`google_add_negative_keywords`

**Pause and resume** `google_pause_campaign` · `google_resume_campaign` · `google_pause_ad_group` ·
`google_resume_ad_group` · `google_pause_ad` · `google_resume_ad`

**Assets and extensions** `google_add_sitelinks` · `google_add_callouts` ·
`google_add_structured_snippets` · `google_add_call_asset` · `google_set_business_name` ·
`google_add_image_assets` · `google_remove_asset_links`

**Performance Max signals** `google_get_search_themes` · `google_add_search_themes` ·
`google_remove_search_themes` · `google_add_audience_signal`

**Labels** `google_create_label` · `google_apply_label` · `google_remove_label`

Removals need `confirm_delete: true`: `google_remove_negative_keywords`, `google_remove_asset_links`,
`google_remove_search_themes`, `google_remove_label`. Nothing else deletes.

## Building a Search campaign

Order matters, and each step is its own call so nothing is guessed.

1. `google_research_keywords` when the user has no list. Needs Basic access on the developer token;
   without it the tool says `access_level_insufficient` instead of inventing volumes.
2. `google_resolve_locations` for every place name. Ambiguity returns candidates; ask.
3. `google_validate_ad_copy` on the headlines and descriptions. Limits: 3 to 15 headlines of 30
   characters, 2 to 4 descriptions of 90, two paths of 15, keyword text up to 80.
4. `validate_campaign_draft` (`diagnostics` router) for a full dry run against the spec.
5. `google_create_search_campaign`. One atomic mutate: budget, campaign PAUSED, location and
   language criteria, ad groups, keywords, one responsive search ad per ad group, optional campaign
   negatives.
6. Read the result back and say what is paused. Then offer extensions as a separate proposal.

Rules that cause most rejections: fewer than 3 headlines or 2 descriptions, ALL-CAPS words, more than
one exclamation mark per ad and none in a headline, and broad match with no negative list.

## Performance Max

`google_create_pmax_campaign` builds budget, campaign, asset group, every text and image asset, and
optional search themes and audience signal in one change. Before proposing it:

- Conversion tracking must exist. Check `google_list_conversion_actions` first; Performance Max
  cannot run without it.
- Asset limits: 3 to 15 headlines of 30, 1 to 5 long headlines of 90, 2 to 5 descriptions of 90,
  business name 25, up to 25 search themes of 80 characters. Images: 1.91:1 at 1200x628, 1:1 at
  1200x1200, optional 4:5 at 960x1200, a square logo, each under 5 MB.
- Search themes are hints, not keywords. They do not restrict where the campaign shows.
- Reporting is asset-group level. There is no search-term report like Search campaigns have.

## Budgets, bids and schedules

- `google_update_campaign_budget` changes the average daily budget. A shared (portfolio) budget is
  detected and reported rather than silently changed: it funds several campaigns.
- `google_update_bid_strategy` switches between maximise conversions (optional target CPA), maximise
  conversion value (optional target ROAS), maximise clicks and manual CPC. Smart Bidding needs
  conversion history; say so when there is none.
- `google_set_ad_schedule` replaces the whole schedule, it does not merge. Read
  `google_get_ad_schedule` first and show the new full week.
- `google_set_device_bid_modifiers` takes multipliers per device. Read
  `google_get_device_performance` first so the change has a reason.

## Wasted spend and negatives

1. `google_analyze_wasted_spend` for keywords and campaigns that spent with zero conversions.
2. `google_analyze_search_terms` for the queries behind them, classified as converting, wasted or new.
3. Propose at most ten negatives at a time and say what each one blocks.
4. `google_add_negative_keywords` at campaign level after a yes.
5. `google_remove_negative_keywords` undoes one, with `confirm_delete: true` and the exact terms
   quoted first.

## When something looks wrong

- `google_explain_performance_anomaly` decomposes a period-over-period change by campaign, device,
  network, country and search term, and ranks what caused it.
- `google_get_geo_performance` and `google_get_hourly_performance` split the same window by place and
  by hour in the account timezone.
- `google_get_benchmark_context` gives indicative Search medians per industry. It is context, not a
  target; label it as such.
- `verify_campaign_is_live` (`diagnostics` router) answers whether a campaign exists, is enabled and
  has a budget it can spend.

## Do not

- Do not pause a campaign as the first answer to weak performance.
- Do not change a shared budget to fix one campaign.
- Do not send a place name, a language name or an audience name into a write call.
- Do not retry a create. Call `google_list_campaigns` and look before acting again.
