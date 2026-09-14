---
name: tiktok-ads
description: Operating procedure for TikTok Ads through Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks about TikTok campaigns, ad groups, in-feed video ads, Spark Ads, identities, video metrics such as hook rate and 6-second views, TikTok pixels and events, interest targeting or creative fatigue on TikTok, and whenever they ask to launch, pause or re-budget a TikTok campaign. It lists the 30 TikTok tools by job, the objective and pixel-event rules, the video asset rules, the budget floors, and the order a launch is built in.
license: MIT
---

# TikTok Ads with Adako

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill covers TikTok Ads: 30
tools behind two routers, `tiktok_ads` for reads and `tiktok_ads_write` for changes.

```
tiktok_ads(action="execute", tool_name="tiktok_list_campaigns", arguments={"advertiser_id":"700000000000000"})
tiktok_ads_write(action="execute", tool_name="tiktok_pause_campaign", arguments={...})
```

`tiktok_get_campaign_performance` is callable by name. The Create, Change and Pause and resume tools
below, and `tiktok_upload_images`, go through `tiktok_ads_write`, and each one becomes a proposal the
user approves. Everything else goes through `tiktok_ads`, where `list_tools` and `get_tool_schema`
are free for every TikTok tool, changes included. Never look anything up through `tiktok_ads_write`.

TikTok appears on the Connections page only where the deployment has TikTok credentials. If the user
does not see it, say it is available on request and write to support rather than promising a date.

## Account contract

- `advertiser_id` is a string. Omit it to use the primary TikTok account.
- Money is a decimal in the account currency.
- Delivery is switched with `operation_status`. Adako only ever sends `ENABLE` or `DISABLE`. The
  platform's `DELETE` is never sent by any tool.

## Tools by job

**See what exists** `tiktok_list_campaigns` · `tiktok_get_campaign_details` · `tiktok_list_ad_groups`
· `tiktok_list_ads` · `tiktok_list_identities` · `tiktok_list_ad_videos` · `tiktok_list_lead_forms` ·
`tiktok_list_pixels`

**Measure** `tiktok_get_campaign_performance` · `tiktok_get_ad_group_performance` ·
`tiktok_get_ad_performance` · `tiktok_get_audience_insights` · `tiktok_analyze_geo_performance`

**Diagnose** `tiktok_analyze_wasted_spend` · `tiktok_detect_creative_fatigue`

**Plan and resolve** `tiktok_explain_objective` (free) · `tiktok_search_targeting` (free) ·
`tiktok_validate_assets` (free) · `tiktok_upload_images`

**Create** `tiktok_create_video_campaign` · `tiktok_add_ad_group` · `tiktok_add_ad`

**Change** `tiktok_update_campaign` · `tiktok_update_ad_group`

**Pause and resume** `tiktok_pause_campaign` · `tiktok_resume_campaign` · `tiktok_pause_ad_group` ·
`tiktok_resume_ad_group` · `tiktok_pause_ad` · `tiktok_resume_ad`

No TikTok tool deletes anything.

## The objective matrix

The objective decides which optimisation goals and pixel events are legal. An invalid pair is
rejected after the campaign row already exists, so settle it first with `tiktok_explain_objective`,
or read the whole rule set with `get_campaign_spec` (`platform: "tiktok_ads"`,
`campaign_type: "video"`).

| Objective       | Optimises for                   | Pixel                                   |
| --------------- | ------------------------------- | --------------------------------------- |
| REACH           | reach, billed on impressions    | no                                      |
| TRAFFIC         | clicks, landing page views      | optional                                |
| VIDEO_VIEWS     | video views, engaged views      | no                                      |
| ENGAGEMENT      | engagement, followers           | no                                      |
| LEAD_GENERATION | instant forms, or website leads | only for website leads                  |
| WEB_CONVERSIONS | conversions, value              | required, with an event the pixel fires |
| APP_PROMOTION   | installs, in-app events         | required                                |

VIDEO_VIEWS is the cheapest way to buy views and the worst proxy for intent. Say that when a user
asks for views and means sales.

## Video and image rules

- In-feed video: 9:16 preferred at 1080x1920, also 1:1 and 16:9; 5 to 60 seconds; minimum 540x960;
  under 500 MB; mp4, mov, mpeg, avi or 3gp. Best-performing length is roughly 21 to 34 seconds.
- Safe zone: keep text and logos out of the top 13% and bottom 20%, where the interface sits.
- Cover image: optional, 9:16. TikTok picks a frame when you omit one. `tiktok_upload_images` puts
  covers in the library and returns image ids.
- Ad text: 100 characters. Display name: 20. Call to action: 30.
- `tiktok_validate_assets` checks a URL is reachable, an accepted format and inside the size limit
  before anything is uploaded. Run it first; an upload failure is expensive to unpick.

## Budget floors

About 20 a day per ad group, and higher at campaign level (commonly about 50). Floors are enforced at
creation, not at edit time, so state them before proposing a budget. Non-USD accounts have the
equivalent.

## Launching a video campaign

1. `tiktok_explain_objective` to fix objective, optimisation goal and billing event.
2. `tiktok_list_identities` for the handle and avatar the viewer sees. Spark Ads need a Business
   Center identity and the creator's post authorisation code; without both the organic post cannot be
   used.
3. `tiktok_list_pixels` when the objective needs one, and check the chosen event has recent traffic.
   An event with no volume never leaves learning.
4. `tiktok_search_targeting` for places, interest categories, interest keywords and languages. Device
   and network values come back as enums to use verbatim.
5. `tiktok_validate_assets` on the video URL.
6. `validate_campaign_draft` on the `diagnostics` router for a full dry run.
7. `tiktok_create_video_campaign` from a video URL, an existing video id, or an organic post for a
   Spark Ad. Campaign, ad group and ad are created PAUSED.
8. Read back and say what is paused. `tiktok_add_ad_group` and `tiktok_add_ad` extend it later.

## Reading results

TikTok metrics include the video set: 2-second and 6-second views, completion, average watch time.
Hook rate is the share of impressions that reach 2 seconds; it is the first number to look at when a
creative underperforms.

- `tiktok_detect_creative_fatigue` compares the halves of a window per ad and flags falling hook
  rate, CTR or CPA against rising frequency. The fix is a new video, not a bid change.
- `tiktok_analyze_wasted_spend` excludes anything still learning or too thin to judge.
- `tiktok_get_audience_insights` splits by age, gender, placement, device OS or language.
- `tiktok_analyze_geo_performance` ranks countries by spend and flags the ones taking budget with
  nothing to show.

## Do not

- Do not run a horizontal video in a vertical feed. Ask for the 9:16 cut.
- Do not propose a Spark Ad without an identity and the authorisation code.
- Do not send interest or place names into a write call.
- Do not judge a new ad group before it leaves the learning period.
