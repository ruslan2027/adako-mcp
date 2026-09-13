---
name: meta-ads
description: Operating procedure for Meta Ads (Facebook and Instagram) through Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks about Meta campaigns, ad sets, ads, objectives, optimisation goals, audiences, placements, pixels, lead forms, creative fatigue or budgets, and whenever they ask to launch, pause, duplicate or re-budget anything on Facebook or Instagram. It lists the 43 Meta tools by job, the objective rules that decide whether an ad set is legal, the resolvers that must run before a write, and the order a launch is built in.
license: MIT
---

# Meta Ads with Adako

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill covers Meta Ads: 43 tools
behind the `meta_ads` router.

```
meta_ads(action="execute", tool_name="meta_list_ad_sets", arguments={"ad_account_id":"act_123456789"})
```

`meta_get_campaign_performance` is callable by name. Everything else goes through the router.

## Account contract

- `ad_account_id` is a string, usually `act_` followed by digits. Omit it to use the primary account.
- Money is a decimal in the account currency, per day or per lifetime, never cents.
- A campaign, ad set or ad id is a string. Never reformat it.
- Meta reports results against the objective's own KPI: purchases and ROAS for sales, leads and cost
  per lead for lead generation, link clicks and CPC for traffic, reach and CPM for awareness.

## Tools by job

**See what exists** `meta_list_campaigns` · `meta_list_ad_sets` · `meta_list_ads` ·
`meta_get_ad_creatives` · `meta_get_ad_set_targeting` · `meta_list_pages` ·
`meta_list_instagram_accounts` · `meta_list_pixels` · `meta_list_custom_audiences` ·
`meta_list_saved_audiences` · `meta_list_lead_forms` · `meta_list_promotable_apps`

**Measure** `meta_get_campaign_performance` · `meta_get_adset_performance` ·
`meta_get_ad_performance` · `meta_get_lead_form_submissions`

**Diagnose** `meta_analyze_wasted_spend` · `meta_detect_creative_fatigue` ·
`meta_get_audience_insights` · `meta_analyze_audiences` · `meta_optimize_placements` ·
`meta_optimize_budget` · `meta_explain_anomaly`

**Resolve before writing** `meta_search_targeting` (free) · `meta_browse_targeting` (free) ·
`meta_validate_creative_url` (free) · `meta_get_ad_set_delivery_estimate`

**Create** `meta_create_image_campaign` · `meta_create_video_campaign` ·
`meta_create_carousel_campaign` · `meta_create_app_install_campaign` · `meta_create_flexible_ad` ·
`meta_add_ad_set` · `meta_add_ad` · `meta_duplicate_campaign`

**Change** `meta_update_campaign` · `meta_update_campaign_budget` · `meta_update_adset_budget` ·
`meta_update_ad_set` · `meta_update_ad` · `meta_set_frequency_cap`

**Pause and resume** `meta_pause_entity` · `meta_resume_entity` (campaign, ad set or ad, by id)

Meta has no delete tools. Pausing is the only way to stop delivery.

## Before any launch

1. `meta_list_pages`. A promotable page is required, and it becomes the ad identity. Two or more
   pages means asking which one; never pick for the user.
2. `meta_list_pixels` when the objective is conversions. A conversion goal without a pixel id and a
   conversion domain is rejected.
3. `meta_search_targeting` for every place, interest and behaviour. A name in a write call is a hard
   error; only ids pass.
4. `meta_validate_creative_url` on every image or video URL. It reports content type, dimensions and
   file size, and checks the copy against the limits.
5. `meta_get_ad_set_delivery_estimate` to show how many people the targeting can reach.

## Copy and asset limits

| Field                        | Limit                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| Primary text                 | 125 characters                                                           |
| Headline                     | 40 characters                                                            |
| Description                  | 30 characters (carousel card description 20)                             |
| Campaign, ad set and ad name | 200 characters                                                           |
| Feed image                   | 1:1, 4:5 or 1.91:1; 1080x1080 or 1080x1350; minimum 600x600; under 30 MB |
| Feed video                   | 4:5, 1:1 or 16:9; best under 15 seconds; hook in the first 3 seconds     |
| Reels and Stories video      | 9:16 at 1080x1920; keep text out of the top and bottom 14%               |
| Carousel                     | 2 to 10 cards, every card 1:1                                            |

## The objective rules

Objective, optimisation goal and billing event must agree or Meta rejects the ad set after the
campaign row already exists. Check the draft first with `validate_campaign_draft` on the
`diagnostics` router (`platform: "meta_ads"`, `campaign_type: "image" | "video" | "carousel"`), or
read the whole rule set with `get_campaign_spec`.

Other hard requirements:

- EU or EEA targeting needs `dsa_beneficiary`, and `dsa_payor` when the payer differs. Ask.
- Housing, credit, employment, social issues, gambling and financial products need
  `special_ad_categories`, which removes most demographic targeting. Say what is lost.
- The ad account needs an active payment method and no policy flags, or nothing delivers however the
  campaign is built.

## Creating a campaign

`meta_create_image_campaign`, `meta_create_video_campaign`, `meta_create_carousel_campaign` and
`meta_create_app_install_campaign` each build the whole stack in one change: campaign, one ad set,
the upload, the creative, one ad. Everything is created PAUSED.

To extend what already exists, use `meta_add_ad_set` (a new audience inside a campaign) and
`meta_add_ad` (a new creative inside an ad set), both paused. `meta_create_flexible_ad` puts several
texts, headlines and images into one ad and lets Meta assemble the combinations.

`meta_duplicate_campaign` copies a campaign with Meta's own duplication, always paused and always
renamed, so the two are never confused.

## Budgets

- Campaign budget optimisation (CBO) funds the ad sets from one campaign-level budget:
  `meta_update_campaign_budget`. When it is on, the ad sets have no budgets of their own.
- Otherwise `meta_update_adset_budget`, daily or lifetime. A lifetime budget must cover the daily
  minimum for every day it runs.
- `meta_optimize_budget` compares ad sets on cost per result, or ROAS where revenue exists, and
  produces a reallocation plan. It is a plan, not a write. Propose the moves one at a time.

## Targeting changes

`meta_update_ad_set` merges targeting, it does not replace it. Read `meta_get_ad_set_targeting`
first, show the diff, and name what is added and what is removed. Editing an ad set restarts the
learning phase; say so before proposing it.

## Fatigue and waste

- `meta_detect_creative_fatigue` compares the first and last days of a window per ad: falling CTR
  with rising frequency and CPM. The fix is new creative, not a bid change.
- `meta_analyze_wasted_spend` finds ad sets that spent with no results, and ad sets whose cost per
  result is far above the account average.
- `meta_optimize_placements` and `meta_analyze_audiences` say where the money went and which segments
  paid it back.
- `meta_explain_anomaly` attributes a period-over-period change to ad sets, placements, countries or
  age and gender groups.

## Do not

- Do not pick a page, pixel or Instagram account when several exist. Ask.
- Do not touch an ad set that is still in the learning phase to "fix" it.
- Do not send interest or place names into a write call.
- Do not compare ROAS across objectives that do not record revenue.
