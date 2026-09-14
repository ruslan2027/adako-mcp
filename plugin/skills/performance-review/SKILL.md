---
name: performance-review
description: How to run a performance review across ad accounts with Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks how campaigns did, what a period cost and returned, why results changed, which campaigns are wasting money, how one week compares with the last, or asks for a weekly or monthly account review across one or several accounts. It gives the order of calls per platform, the metric each objective is judged on, how to fan out across accounts, how to explain a change instead of guessing at it, and how to present the numbers.
license: MIT
---

# Running a performance review

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill is the reading half: how
to answer "how are we doing" with numbers that hold up.

Reads run immediately, change nothing and are free. Every call in a review is a read, so none of
them goes through a `_write` router.

## Start

1. `start_here` if you do not know what is connected. Free.
2. `list_connected_accounts` for ids, names, currencies and timezones. Free.
3. Fix the window before calling anything. `last_30_days` by default; `last_7_days` only when the
   user asked for the week, and then say a week is not a trend.

Every performance tool returns the previous period of the same length beside the current one. Report
both. A number without its baseline is not an answer.

## The first call per platform

| Platform     | Call                                | Callable by name |
| ------------ | ----------------------------------- | ---------------- |
| Google Ads   | `google_get_campaign_performance`   | yes              |
| Meta Ads     | `meta_get_campaign_performance`     | yes              |
| ChatGPT Ads  | `chatgpt_get_performance`           | yes              |
| TikTok Ads   | `tiktok_get_campaign_performance`   | yes              |
| LinkedIn Ads | `linkedin_get_campaign_performance` | yes              |

Everything deeper goes through the platform's read router:
`google_ads(action="execute", tool_name="google_get_ad_group_performance", arguments={...})`.

## Judge each objective on its own metric

- Google Search: cost, clicks, CTR, conversions, CPA, and ROAS only where conversion value exists.
- Meta: the tool already picks the objective's KPI. Purchases and purchase ROAS for sales, leads and
  cost per lead for lead generation, link clicks and CPC for traffic, reach and CPM for awareness.
- TikTok: spend, clicks, conversions, plus the video set. Hook rate (2-second views over
  impressions), 6-second views, completion, average watch time.
- LinkedIn: spend, clicks, CTR, CPC, leads, cost per lead, website conversions. Engagement metrics
  are a separate call, `linkedin_get_engagement_metrics`.
- ChatGPT Ads: impressions, clicks, spend, conversions and the derived ratios.

Do not report ROAS on an objective that records no revenue. Say what the account actually measures.

## Narrowing down

Work down one level at a time, and stop when the answer is clear.

**Google** `google_get_campaign_performance` → `google_get_ad_group_performance` →
`google_get_keyword_performance` → `google_analyze_search_terms`. Cut sideways with
`google_get_device_performance`, `google_get_geo_performance`, `google_get_hourly_performance`.

**Meta** `meta_get_campaign_performance` → `meta_get_adset_performance` (with a breakdown) →
`meta_get_ad_performance`. Then `meta_optimize_placements` and `meta_analyze_audiences`.

**TikTok** `tiktok_get_campaign_performance` → `tiktok_get_ad_group_performance` →
`tiktok_get_ad_performance`, plus `tiktok_get_audience_insights` and
`tiktok_analyze_geo_performance`.

**LinkedIn** `linkedin_get_campaign_performance` → `linkedin_get_creative_performance`, plus
`linkedin_get_audience_insights` for job title, industry, seniority and company size.

## Explaining a change

Never guess at a cause. Three tools decompose one:

- `google_explain_performance_anomaly` ranks campaigns, devices, networks, countries and search terms
  by how much of the change each accounts for.
- `meta_explain_anomaly` attributes a change to ad sets, placements, countries or age and gender.
- Where no decomposition tool exists, compare the two periods at the next level down and say which
  object moved.

If the data does not explain the change, say that, and name what would: a tracking gap, a seasonal
week, a creative approved mid-period, a budget raised on the 14th.

## Finding waste

- `google_analyze_wasted_spend` and `google_analyze_search_terms`
- `meta_analyze_wasted_spend` and `meta_detect_creative_fatigue`
- `tiktok_analyze_wasted_spend` and `tiktok_detect_creative_fatigue`
- `linkedin_analyze_wasted_spend` and `linkedin_analyze_creative_performance`

Each excludes the learning phase and trivial spend, so treat what they return as real. Present waste
as money and share of spend, not as a list of ids.

## Several accounts at once

A platform read router fans a read out across accounts:

```
google_ads(action="execute", tool_name="google_get_campaign_performance", arguments={"date_range":"last_30_days"}, accounts="all_active")
```

- `accounts` takes a list of ids or `"all_active"`. Reads only, free, at most 20 accounts.
- One table per currency. Never sum or average across currencies.
- Name the accounts included, and say which were skipped and why.
- Check `get_usage_status` first on a small plan.

## Presenting it

1. One sentence with the headline: spend, the objective's KPI, and the direction against the previous
   period.
2. One table: campaign, spend, the KPI, the change. Numbers with currency, tabular and rounded
   sensibly.
3. Two or three findings, each tied to a number you actually read.
4. One recommendation, with the tool that would carry it out and what it would cost. Do not run it.

Recommend a pause only after explaining what the money bought. Weak performance in a window is not
proof of a bad campaign.

## Do not

- Do not average metrics across accounts in different currencies.
- Do not present a 7-day window as a trend.
- Do not compute a metric the tool already returns; use its own numbers.
- Do not attribute a change to a cause you did not measure.
- Do not spend the user's whole quota fanning out when one account answers the question.
