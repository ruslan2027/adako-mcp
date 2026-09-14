---
name: optimize
description: How to improve an existing ad account with Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks to cut wasted spend, add negative keywords, reallocate or raise budgets, change a bid strategy, fix placements or audiences, pause what is not working, or asks "what should I do about this account". It gives the order to work in, which diagnosis tool feeds which change, how to size a change, how to phrase the proposal, and what to leave alone.
license: MIT
---

# Optimising an account

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill is what to do after the
review: which change to propose, how big, and in what order.

Every change here is a write, so every one becomes a proposal the user approves. Nothing moves on
its own. Changes run through the platform's `_write` router (`google_ads_write`, `meta_ads_write`,
`tiktok_ads_write`, `linkedin_ads_write`, `chatgpt_ads_write`); the diagnosis tools stay on the read
router (`google_ads` and so on).

## The order

1. **Stop the leak.** Waste that produces nothing is the cheapest win and the easiest to explain.
2. **Fix measurement.** A budget decision on broken tracking is a guess.
3. **Move money towards what works.** Reallocate before you raise.
4. **Then change bids, placements or audiences.** One variable at a time.
5. **Creative last, and only with evidence of fatigue.**

Propose one change at a time. A proposal that bundles four edits cannot be judged or undone cleanly.

## 1. Stop the leak

| Platform | Diagnose                                                        | Change                                                                                       |
| -------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Google   | `google_analyze_wasted_spend`, `google_analyze_search_terms`    | `google_add_negative_keywords`, `google_update_keyword`, `google_bulk_update_keyword_status` |
| Meta     | `meta_analyze_wasted_spend`                                     | `meta_pause_entity`, `meta_update_adset_budget`                                              |
| TikTok   | `tiktok_analyze_wasted_spend`, `tiktok_analyze_geo_performance` | `tiktok_pause_ad_group`, `tiktok_update_ad_group`                                            |
| LinkedIn | `linkedin_analyze_wasted_spend`                                 | `linkedin_pause_campaign`, `linkedin_pause_creative`, `linkedin_update_campaign`             |

On Google, negatives come before pausing: blocking ten wasteful queries keeps the campaign that
also produces the conversions. Recommend at most ten at a time and say what each one blocks.

## 2. Fix measurement

- `google_list_conversion_actions` and `google_get_conversion_action_performance`: is the action that
  Smart Bidding optimises against the one the business cares about, and is it in the "Conversions"
  column at all?
- `meta_list_pixels`: when did the pixel last receive an event, and which standard events does it
  record?
- `tiktok_list_pixels` and `linkedin_list_conversions`: same question on those platforms.
- `chatgpt_get_pixel_settings`: the event ids a conversions campaign optimises towards.

If conversions are not recorded properly, say so and stop. Do not optimise towards a broken number.

## 3. Move money

- `google_optimize_budget_allocation` produces a plan from what each campaign returns and whether it
  is actually budget-limited. It is a plan, not a write.
- `meta_optimize_budget` does the same across ad sets, on cost per result or ROAS where revenue
  exists.

Then carry it out one campaign at a time: `google_update_campaign_budget`,
`meta_update_campaign_budget` or `meta_update_adset_budget`, `tiktok_update_ad_group`,
`linkedin_update_campaign`, `linkedin_batch_update_campaigns`.

Sizing rules:

- Raise by at most 20 to 30% of the current daily budget in one step, then wait for the platform to
  settle. A doubled budget restarts learning.
- Cut a losing budget rather than pausing, when the campaign still produces something.
- A shared or portfolio budget funds several campaigns. Google reports it rather than changing it
  silently; propose a dedicated budget instead.
- Under campaign budget optimisation on Meta, the ad sets have no budgets of their own. Change the
  campaign.

## 4. Bids, placements, audiences

- `google_update_bid_strategy`: maximise conversions with a target CPA, maximise conversion value
  with a target ROAS, maximise clicks, or manual CPC. Smart Bidding needs conversion history; say
  when there is not enough. Read `google_list_bidding_strategies` first to see whether the campaign
  sits in a portfolio.
- `google_set_device_bid_modifiers` after `google_get_device_performance`, never before.
- `google_set_ad_schedule` replaces the whole week. Read `google_get_ad_schedule` first and show the
  full new schedule.
- `meta_optimize_placements` then `meta_update_ad_set`. Targeting merges rather than replaces, so
  name exactly what is added and what is removed, and say that editing an ad set restarts learning.
- `meta_analyze_audiences` and `meta_get_audience_insights` before any audience change.
- `tiktok_get_audience_insights` then `tiktok_update_ad_group`.
- `linkedin_get_audience_insights` then `linkedin_update_campaign`. Check
  `linkedin_estimate_audience_size` stays above 300.

## 5. Creative

Fatigue is falling CTR with rising frequency and CPM, not a single bad day.

- `meta_detect_creative_fatigue`, `tiktok_detect_creative_fatigue`,
  `linkedin_analyze_creative_performance`, `google_get_asset_performance`.
- The fix is new creative: `meta_add_ad`, `tiktok_add_ad`, `linkedin_add_creative`,
  `google_create_responsive_search_ad`. Pause the tired ad only after the new one is approved.
- On Google, swap the LOW assets `google_get_asset_performance` names rather than rebuilding the ad.

## Sizing and phrasing a proposal

Every proposal should answer four questions in one short paragraph:

1. What object, by name and id.
2. What changes, before and after, with currency.
3. What it is expected to do, in the account's own numbers.
4. What happens if it is wrong, and how to undo it.

Example: "Lower the daily budget on Brand Search (id 123) from 80 to 60 USD. It spent 2,400 USD in
30 days at a CPA of 96 USD against a target of 60. At 60/day the campaign keeps the top-of-page
share it had in June. Raising it back is one call."

## What to leave alone

- Anything still in its learning period.
- A campaign the user has not read in this conversation.
- A budget the user did not ask about.
- Seasonal swings with an obvious cause.
- Anything with too little data to judge. Say how much data would be enough and when it will exist.

## Do not

- Do not bundle several edits into one proposal.
- Do not raise and re-target in the same step; you will not know which moved the numbers.
- Do not pause a campaign as the first answer to weak performance.
- Do not remove negatives, assets, search themes or labels without `confirm_delete: true` and an
  explicit yes.
- Do not optimise against a metric the account does not actually record.
