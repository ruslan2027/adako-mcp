---
name: linkedin-ads
description: Operating procedure for LinkedIn Ads through Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks about LinkedIn campaign groups, campaigns, sponsored content creatives, B2B targeting by job title, industry, seniority or company size, audience size and forecasts, lead gen forms, conversion rules, cost per lead or creative fatigue on LinkedIn, and whenever they ask to launch, clone, pause or re-budget a LinkedIn campaign. It lists the 34 LinkedIn tools by job, the organisation and audience-size rules, the asset limits, and the order a launch is built in.
license: MIT
---

# LinkedIn Ads with Adako

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill covers LinkedIn Ads: 34
tools behind the `linkedin_ads` router.

```
linkedin_ads(action="execute", tool_name="linkedin_list_campaigns", arguments={"ad_account_id":"512345678"})
```

`linkedin_get_campaign_performance` is callable by name. Everything else goes through the router.

LinkedIn appears on the Connections page only where the deployment has LinkedIn credentials. If the
user does not see it, say it is available on request.

## Account contract

- `ad_account_id` is a string of digits. Omit it to use the primary LinkedIn account.
- Money is a decimal in the account currency, daily or lifetime.
- LinkedIn's hierarchy is campaign group, then campaign, then creative. Every campaign must sit in a
  group, and the group is where a shared lifetime budget lives.
- Tokens last 60 days and programmatic refresh needs platform approval, so a connection can lapse
  mid-flight. `needs_reauth` means reconnect, not retry.

## Tools by job

**See what exists** `linkedin_get_organizations` · `linkedin_list_campaign_groups` ·
`linkedin_list_campaigns` · `linkedin_get_campaign_structure` · `linkedin_list_creatives` ·
`linkedin_list_conversions`

**Measure** `linkedin_get_campaign_performance` · `linkedin_get_creative_performance` ·
`linkedin_get_engagement_metrics` · `linkedin_get_audience_insights`

**Diagnose** `linkedin_analyze_creative_performance` · `linkedin_analyze_wasted_spend`

**Plan and resolve** `linkedin_explain_objectives` (free) · `linkedin_search_targeting` (free) ·
`linkedin_validate_assets` (free) · `linkedin_estimate_audience_size` ·
`linkedin_forecast_campaign_supply`

**Create** `linkedin_create_campaign_group` · `linkedin_create_image_campaign` ·
`linkedin_create_video_campaign` · `linkedin_create_carousel_campaign` ·
`linkedin_create_text_campaign` · `linkedin_add_creative` · `linkedin_clone_campaign`

**Change** `linkedin_update_campaign` · `linkedin_update_campaign_group` ·
`linkedin_batch_update_campaigns` · `linkedin_manage_conversions` · `linkedin_associate_conversion`

**Pause and resume** `linkedin_pause_campaign` · `linkedin_resume_campaign` ·
`linkedin_pause_creative` · `linkedin_resume_creative`

`linkedin_delete_creative` is the only removal and needs `confirm_delete: true`. Prefer
`linkedin_pause_creative`.

## Hard rules

1. **The organisation is mandatory.** `linkedin_get_organizations` returns the company pages the
   login administers. The page authors the dark post and cannot be changed after creation.
2. **Minimum audience 300 members.** Narrow B2B facets hit that floor fast. Run
   `linkedin_estimate_audience_size` before proposing anything, and widen the facets rather than
   launching a campaign that cannot start.
3. **Targeting facets are URNs.** `linkedin_search_targeting` turns titles, industries, seniorities,
   company sizes, locations, skills, interests, employers, degrees and locales into the URNs a write
   accepts. A job title typed as text is a hard error.
4. **Budget floor is about 10 a day** per campaign, and the same for a lifetime budget divided across
   its days. LinkedIn is the most expensive of the five platforms per click; 10 a day buys very
   little. Say so.
5. **Objectives decide formats.** `linkedin_explain_objectives` says what each objective optimises
   for, which formats and cost types it allows, and whether it needs a conversion rule at all.

## Asset and copy limits

| Field           | Limit                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| Campaign name   | 255 characters                                                                     |
| Intro text      | 600 characters, but it collapses behind "see more" after about 150                 |
| Headline        | 200 characters                                                                     |
| Description     | 70 characters                                                                      |
| Text ad         | headline 25, description 75                                                        |
| Sponsored image | 1.91:1 at 1200x627 or 1:1 at 1200x1200; minimum 640x360; under 5 MB; jpg, png, gif |
| Video           | 1:1, 16:9 or 9:16; mp4; 3 seconds to 30 minutes; under 200 MB; caption it          |

`linkedin_validate_assets` checks the image URLs against those specs before anything is created. A
1.91:1 image is cropped to square in some placements, so check the square crop too.

## Launching an image campaign

1. `linkedin_get_organizations`.
2. `linkedin_search_targeting` for every facet the user described.
3. `linkedin_estimate_audience_size`, and `linkedin_forecast_campaign_supply` when the user wants to
   know what a budget buys and what the auction costs.
4. `linkedin_validate_assets` on the image URL.
5. `validate_campaign_draft` on the `diagnostics` router for a full dry run.
6. `linkedin_create_image_campaign`. It reuses a campaign group or creates one, then the campaign,
   the image upload, the dark post authored by the page, and the creative. Everything PAUSED.
7. Read back, then wire up measurement: `linkedin_list_conversions` and
   `linkedin_associate_conversion` so leads report against that campaign's spend.

`linkedin_clone_campaign` copies an existing campaign's settings into a new paused one, with optional
overrides. It is the cheapest way to test a second audience against the same creative.

## Reading results

- `linkedin_get_campaign_performance` gives spend, impressions, clicks, CTR, CPC, CPM, leads, cost
  per lead and website conversions, next to the previous period.
- `linkedin_get_engagement_metrics` gives the social half: reactions, comments, shares, follows,
  video views and completions.
- `linkedin_get_audience_insights` breaks delivery down by job title, industry, seniority, company
  size, country, function or company. This is the report B2B buyers actually want.
- `linkedin_analyze_creative_performance` ranks creatives on CTR and cost per lead and flags the ones
  whose CTR fell in the second half of the window. On LinkedIn's small, repeatedly reached audiences
  fatigue arrives fast.
- `linkedin_analyze_wasted_spend` finds impressions with no clicks, clicks with no leads, and cost
  per lead far above the account average.

## Do not

- Do not launch under 300 reachable members.
- Do not promise a page change after creation. It is fixed.
- Do not delete a creative when pausing does the job.
- Do not compare LinkedIn CPC with any other platform's without saying why it is higher.
