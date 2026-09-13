---
name: creative
description: Copy limits, asset specs and the creative fatigue playbook for Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user asks to write, review, resize or refresh ad copy, headlines, descriptions, primary text, chat cards or video and image assets for those platforms, asks why an ad was rejected or is underperforming, or asks whether a creative will fit. It carries the exact character counts and image and video specs per platform, the free validator tool for each, and what to do when click-through falls while frequency rises.
license: MIT
---

# Creative: limits and fatigue

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Adako never writes copy. You write
it; Adako checks it against the platform rules before anything is created.

Check first, propose second. Every validator below is free and instant.

| Platform     | Validator                                                       |
| ------------ | --------------------------------------------------------------- |
| Google Ads   | `google_validate_ad_copy`, `google_validate_and_prepare_assets` |
| Meta Ads     | `meta_validate_creative_url`                                    |
| ChatGPT Ads  | `chatgpt_validate_chat_card`                                    |
| TikTok Ads   | `tiktok_validate_assets`                                        |
| LinkedIn Ads | `linkedin_validate_assets`                                      |

`get_campaign_spec` on the `diagnostics` router returns the full field list and asset rules for any
campaign type, and `validate_campaign_draft` checks a whole draft at once.

## Google Ads

**Responsive search ad**

| Field         | Count   | Characters |
| ------------- | ------- | ---------- |
| Headlines     | 3 to 15 | 30         |
| Descriptions  | 2 to 4  | 90         |
| Display paths | 2       | 15 each    |
| Final URL     | 1       | 2048       |
| Keyword text  |         | 80         |

Under about 8 headlines Google reports a poor ad strength. One exclamation mark per ad and none in a
headline. ALL-CAPS words are disapproved. No duplicate headlines.

**Performance Max asset group**

| Field          | Count    | Characters |
| -------------- | -------- | ---------- |
| Headlines      | 3 to 15  | 30         |
| Long headlines | 1 to 5   | 90         |
| Descriptions   | 2 to 5   | 90         |
| Business name  | 1        | 25         |
| Search themes  | up to 25 | 80         |

Images: 1.91:1 at 1200x628 (minimum 600x314), 1:1 at 1200x1200 (minimum 300x300), optional 4:5 at
960x1200, square logo 1200x1200 (minimum 128x128), optional 4:1 logo at 1200x300. Each under 5 MB,
jpg or png. Video must already be on YouTube and be at least 10 seconds; Google generates one from
your assets when you supply none.

**Extensions** Sitelinks, callouts, structured snippets (a fixed header plus 3 to 10 values), call
assets and a business name are separate tools: `google_add_sitelinks`, `google_add_callouts`,
`google_add_structured_snippets`, `google_add_call_asset`, `google_set_business_name`.
`google_get_asset_performance` reports each headline and description as BEST, GOOD, LOW, LEARNING or
PENDING. Swap the LOW ones rather than rebuilding the ad.

## Meta Ads

| Field                        | Characters                        |
| ---------------------------- | --------------------------------- |
| Primary text                 | 125                               |
| Headline                     | 40                                |
| Description                  | 30 (carousel card description 20) |
| Campaign, ad set and ad name | 200                               |

- Feed image: 1:1, 4:5 or 1.91:1; 1080x1080 or 1080x1350; minimum 600x600; under 30 MB; jpg or png.
- Stories and Reels: 9:16 at 1080x1920. Keep text and logos out of the top and bottom 14%.
- Feed video: 4:5, 1:1 or 16:9; best under 15 seconds; hook in the first 3 seconds, where most views
  end. Reels and Stories video: 9:16, up to 90 seconds.
- Carousel: 2 to 10 cards, every card 1:1. Mixed ratios get cropped. Two cards is usually worse than
  one image; use a carousel when there are at least three real things to show.
- Text over about 20% of the image is no longer rejected but still suppresses delivery.
- `meta_create_flexible_ad` carries several texts, headlines and images in one ad and lets Meta
  assemble the combinations.

## ChatGPT Ads

One format, the chat card.

| Field           | Limit                                                          |
| --------------- | -------------------------------------------------------------- |
| Title           | 3 to 50 characters                                             |
| Body            | up to 100 characters                                           |
| Destination URL | https, up to 2048                                              |
| Image           | square, at least 400 px a side, under 10 MB, jpeg, png or webp |
| Context hints   | up to 20, each up to 100 characters                            |

The card crops to a square, so a non-square asset is cropped by the platform rather than by you.
Review is per ad and the verdict shows in `chatgpt_list_ads`.

## TikTok Ads

| Field          | Limit          |
| -------------- | -------------- |
| Ad text        | 100 characters |
| Display name   | 20 characters  |
| Call to action | 30 characters  |

- In-feed video: 9:16 at 1080x1920 preferred, also 1:1 and 16:9; 5 to 60 seconds; minimum 540x960;
  under 500 MB; mp4, mov, mpeg, avi, 3gp.
- Best-performing length is about 21 to 34 seconds.
- Safe zone: keep text and logos out of the top 13% and the bottom 20%.
- Cover frame: optional, 9:16. TikTok picks a frame when you omit one.
- Horizontal video in a vertical feed reads as recycled television. Ask for the vertical cut.

## LinkedIn Ads

| Field         | Characters                                              |
| ------------- | ------------------------------------------------------- |
| Intro text    | 600, but it collapses behind "see more" after about 150 |
| Headline      | 200                                                     |
| Description   | 70                                                      |
| Text ad       | headline 25, description 75                             |
| Campaign name | 255                                                     |

- Sponsored image: 1.91:1 at 1200x627 or 1:1 at 1200x1200; minimum 640x360; under 5 MB; jpg, png or
  gif. A 1.91:1 image is cropped to square in some placements, so check the square crop.
- Video: 1:1, 16:9 or 9:16; mp4; 3 seconds to 30 minutes; under 200 MB. Under 30 seconds for
  awareness, 15 for a single message. Caption it; most feed video plays silent.
- Carousel: 2 to 10 square images, each with its own headline and destination.

## Writing for each platform

- Search: the query is the context. Put the term in a headline, the offer in the second, proof in the
  third. Descriptions carry the detail the headline cannot.
- Feed (Meta, LinkedIn): the first line is the ad. Everything after "see more" is for the people
  already convinced.
- TikTok: the first 3 seconds decide. Hook, then the claim, then the call to action.
- Chat card: 50 characters of title and 100 of body. One idea, one destination.

Never claim a result the account cannot show. Never put a price, a discount or a guarantee in copy
the user did not give you.

## The fatigue playbook

Fatigue is a pattern, not a bad day: click-through falling while frequency and CPM rise, over a
window of at least 14 days.

1. Detect. `meta_detect_creative_fatigue`, `tiktok_detect_creative_fatigue`,
   `linkedin_analyze_creative_performance`, `google_get_asset_performance`.
2. Confirm the shape. Falling CTR alone can be a seasonal week or an audience change. Rising
   frequency beside it is the signal.
3. Check reach first. On a small audience, frequency climbs because the audience is exhausted, not
   because the creative is tired. Widen the audience, or cap it: `meta_set_frequency_cap`.
4. Refresh, do not restart. Add a new ad in the same ad set or campaign so the learning survives:
   `meta_add_ad`, `tiktok_add_ad`, `linkedin_add_creative`, `google_create_responsive_search_ad`.
5. Change one thing. New hook, or new image, or new offer. Changing all three teaches nothing.
6. Pause the tired ad after the new one is approved and delivering, not before.
7. On Google, swap the assets marked LOW instead of building a new ad.

Rough refresh cadence: TikTok fastest, then Meta, then LinkedIn, whose audiences are small and
reached repeatedly. Let the numbers set it, not the calendar.

## Do not

- Do not propose copy that has not been through the platform's validator.
- Do not send an asset URL that needs a login; the platform must fetch it.
- Do not stretch a horizontal asset into a vertical placement.
- Do not pause every ad in an ad set at once to "reset" it.
- Do not call one week of falling CTR fatigue.
