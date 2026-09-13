---
name: launch
description: How to launch a new campaign safely with Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks to create, launch, set up or draft a campaign, ad group, ad set or ad on any of those platforms, or asks what a launch needs before it can go live. It gives the pre-flight checks, the resolver calls that must run before any write, the create tool and minimum budget per platform, what the proposal must show, and how to read a launch back and verify it.
license: MIT
---

# Launching a campaign

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Every campaign it creates is created
**PAUSED**, and every create is a proposal the user approves first.

A launch is the most expensive thing you can get wrong. Work through the checks in order.

## 1. Know the account

`start_here`, or `list_connected_accounts` when you need ids. Note the currency and the timezone.
Every budget you quote carries its currency.

If the platform the user named is not connected, say so and hand over the connections link. Do not
substitute another platform.

## 2. Read the spec

`get_campaign_spec` on the `diagnostics` router returns the whole rule set for one campaign type:
required and optional fields, text and asset limits, the objective matrix, the minimum budget, what
Adako creates in what order, and the pitfalls that cause most rejections. It is free.

```
diagnostics(action="execute", tool_name="get_campaign_spec", arguments={"platform":"meta_ads","campaign_type":"image"})
```

Campaign types with a spec: `google_ads/search`, `google_ads/performance_max`, `meta_ads/image`,
`meta_ads/video`, `meta_ads/carousel`, `chatgpt_ads/chat_card`, `tiktok_ads/video`,
`linkedin_ads/image`, `linkedin_ads/video`, `linkedin_ads/carousel`, `linkedin_ads/text`.

## 3. Resolve everything

Free text never reaches a write call. Ambiguity stops the launch and goes back to the user.

| Platform     | Resolvers                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Google Ads   | `google_resolve_locations`, `google_list_languages`, `google_research_keywords`, `google_search_audiences`              |
| Meta Ads     | `meta_search_targeting`, `meta_browse_targeting`, `meta_list_pages`, `meta_list_pixels`, `meta_list_instagram_accounts` |
| ChatGPT Ads  | `chatgpt_geo_lookup`, `chatgpt_get_account_limits`, `chatgpt_list_pixels`                                               |
| TikTok Ads   | `tiktok_search_targeting`, `tiktok_list_identities`, `tiktok_list_pixels`, `tiktok_list_ad_videos`                      |
| LinkedIn Ads | `linkedin_search_targeting`, `linkedin_get_organizations`, `linkedin_list_campaign_groups`                              |

## 4. Check the creative

| Platform     | Check                                                           |
| ------------ | --------------------------------------------------------------- |
| Google Ads   | `google_validate_ad_copy`, `google_validate_and_prepare_assets` |
| Meta Ads     | `meta_validate_creative_url`                                    |
| ChatGPT Ads  | `chatgpt_validate_chat_card`                                    |
| TikTok Ads   | `tiktok_validate_assets`                                        |
| LinkedIn Ads | `linkedin_validate_assets`                                      |

All free. They fetch the asset, measure it and check the copy lengths. A failed review costs days;
this costs nothing.

## 5. Dry run the draft

`validate_campaign_draft` on the `diagnostics` router checks the whole draft field by field against
the spec and returns every problem with a severity and a fix. Free. Run it before you show the plan,
so the plan you show is one that can actually be created.

## 6. Show the plan

Before the write, put the whole thing in front of the user in one message:

- objective, and what it optimises for;
- daily or lifetime budget **with its currency**, and whether it clears the platform floor;
- audience in words, with the resolved ids behind it;
- placements or networks;
- the creative, in full, exactly as it will read;
- what will exist afterwards, and that all of it is paused.

Then wait for a yes.

## 7. Create

| Platform               | Tool                                | Minimum budget                              | Cost    |
| ---------------------- | ----------------------------------- | ------------------------------------------- | ------- |
| Google Search          | `google_create_search_campaign`     | about 1/day, no published floor             | 1 task  |
| Google Performance Max | `google_create_pmax_campaign`       | plan 10 to 20x target CPA/day               | 1 task  |
| Meta image             | `meta_create_image_campaign`        | about 1/day on impressions, 5/day on clicks | 3 tasks |
| Meta video             | `meta_create_video_campaign`        | as above                                    | 3 tasks |
| Meta carousel          | `meta_create_carousel_campaign`     | as above                                    | 3 tasks |
| Meta app install       | `meta_create_app_install_campaign`  | as above                                    | 3 tasks |
| ChatGPT Ads            | `chatgpt_launch_ad`                 | 1.00 lifetime, floor on both limits         | 8 tasks |
| TikTok video           | `tiktok_create_video_campaign`      | about 20/day per ad group                   | 3 tasks |
| LinkedIn image         | `linkedin_create_image_campaign`    | about 10/day per campaign                   | 1 task  |
| LinkedIn video         | `linkedin_create_video_campaign`    | about 10/day per campaign                   | 1 task  |
| LinkedIn carousel      | `linkedin_create_carousel_campaign` | about 10/day per campaign                   | 1 task  |
| LinkedIn text ad       | `linkedin_create_text_campaign`     | about 10/day per campaign                   | 1 task  |

Each of these builds the whole stack in one change: container, campaign, upload, creative, ad. All
PAUSED. Say the task cost before an expensive one.

To extend something that already exists rather than start over: `meta_add_ad_set`, `meta_add_ad`,
`tiktok_add_ad_group`, `tiktok_add_ad`, `chatgpt_create_ad_group`, `chatgpt_create_ad`,
`linkedin_add_creative`, `google_create_responsive_search_ad`.

## 8. Read it back, then verify

The create returns the read-back: the ids that now exist and their status. Report it plainly, and
name the one step left for the user, which is enabling it.

Then `verify_campaign_is_live` on the `diagnostics` router answers whether the campaign exists, is
switched on, and has a budget it can spend. Use it instead of assuming.

## If a create fails

1. Stop. Do not call the create again.
2. Call the platform's list tool and see what exists. A failed create often leaves a campaign row
   behind with no ad set under it.
3. `why_did_this_fail` reads the real call log and explains the last failures with their fix.
4. `explain_error` translates a raw platform message into a cause and a next tool.
5. Tell the user exactly what exists now, then propose the smallest repair: add the missing level
   rather than rebuild.

## Do not

- Do not create anything unpaused. There is no flag for it and no exception.
- Do not guess an id, an interest, a place, a page or an identity.
- Do not propose a budget under the platform floor without saying it is under the floor.
- Do not launch into an audience below the platform's minimum (LinkedIn needs 300 members).
- Do not retry a create after a timeout.
- Do not write copy into an account the user has not read.
