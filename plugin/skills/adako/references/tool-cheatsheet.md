# Adako tool cheatsheet

One line per tool: name, risk, cost in tasks, and when to reach for it. 233 tools across five ad
platforms plus Adako itself.

- **R**: read-only. Runs immediately, changes nothing.
- **W**: write. Creates a proposal; nothing changes until the user approves.
- **D**: destructive write. Pauses, removes or re-budgets live objects. Say what it touches, then wait for a yes.
- **Cost**: Adako tasks. `0` is free and never counted.
- **Pro+**: the tool needs the Pro plan or above.

How to call: the tools in the client tool list are called by name: every System, Discovery and Proposals tool, and the
tools marked **direct** below. Everything else goes through a router, as
`router(action="execute", tool_name="…", arguments={...})`:

- **R** tools run through the read router: `google_ads`, `meta_ads`, `chatgpt_ads`, `tiktok_ads`, `linkedin_ads`,
  `monitoring` or `diagnostics`. Its `list_tools` and `get_tool_schema` are free and cover every tool, changes included.
- **W** and **D** tools run through the matching `_write` router: `google_ads_write`, `meta_ads_write`,
  `chatgpt_ads_write`, `tiktok_ads_write`, `linkedin_ads_write` or `monitoring_write`. It only executes, and each call
  becomes a proposal. Never look anything up through it.

## Adako system: 32 tools

### System (6)

| Tool                      | Risk | Cost | When to use                                                                                                                                                        |
| ------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `start_here`              | R    | 0    | Call this first in a new conversation, or whenever you are unsure what the user can do.                                                                            |
| `check_media`             | R    | 0    | Checks an image or video before an ad is built from it — repairs share links, reads the real file, judges it per platform — and, called with no arguments, says where to put a file that has no link. |
| `get_connections_status`  | R    | 0    | Shows every platform login the user has connected, its token health (active / needs re-authorisation / revoked), and the active + primary ad accounts under it.    |
| `list_connected_accounts` | R    | 0    | Lists every ad account Adako knows for this user, with platform id, name, currency, timezone, and whether it is active and primary.                                |
| `switch_primary_account`  | W    | 0    | Makes one account the primary account for its platform, the one later tools use when no account id is passed, and switches it on if it was inactive.               |
| `get_usage_status`        | R    | 0    | Returns the user's plan, tasks used vs limit for the current period, when it resets, ad accounts used this billing period vs the plan limit, and the upgrade link. |

### Diagnostics (8)

| Tool                      | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `explain_error`           | R    | 0    | Translates a raw error from any connected ad platform into a plain-language cause, a concrete fix, and the Adako tool to call next.                                                          |
| `get_campaign_spec`       | R    | 0    | Returns the full specification for one campaign type: required and optional fields, text and asset limits, the objective matrix, the minimum budget, what Adako creates in what order, and…  |
| `validate_campaign_draft` | R    | 0    | Checks a campaign draft field by field against Adako's spec for that platform and campaign type, and returns every problem with a severity and what to do about it.                          |
| `why_did_this_fail`       | R    | 0    | Reads this user's real Adako call log, finds the calls that failed or were blocked, and explains each one: the cause, the fix, and the tool to call next.                                    |
| `verify_campaign_is_live` | R    | 0    | Answers one question with real data: does this campaign exist, is it switched on, and does it have a budget it can spend?                                                                    |
| `suggest_next_action`     | R    | 0    | Looks at this user's actual state — connections, active accounts, pending approvals, the last ten calls and the remaining quota — and returns three concrete next steps, each with the tool… |
| `list_what_i_can_do`      | R    | 0    | Lists what Adako can actually do for THIS user: the tools available on the platforms they have connected, grouped by job, plus the Adako-level abilities that work without any platform.     |
| `usage_value_summary`     | R    | 0    | Summarises this user's real activity over a period: tasks by platform and by kind of work, reads versus writes, proposals created, approved, rejected and executed, the five most-used tool… |

### Discovery (2)

| Tool                       | Risk | Cost | When to use                                                                                                                              |
| -------------------------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `search_tools` (direct)    | R    | 0    | Finds the tools that do a job, ranked, from the user's own wording.                                                                      |
| `get_tool_schema` (direct) | R    | 0    | Returns the live JSON schema of one or more tools: required fields, enums, defaults, example prompts and the exact line to call it with. |

### Proposals (3)

| Tool                     | Risk | Cost | When to use                                                                                 |
| ------------------------ | ---- | ---- | ------------------------------------------------------------------------------------------- |
| `list_pending_proposals` | R    | 0    | Lists writes that were proposed but not yet approved, with their preview and expiry (48 h). |
| `approve_proposal`       | D    | 0    | Executes a pending proposal exactly once and reads the object back.                         |
| `reject_proposal`        | W    | 0    | Marks a pending proposal as rejected so it will never execute.                              |

### Monitors (8)

| Tool                   | Risk | Cost | When to use                                                                                                                                               |
| ---------------------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_monitor`       | W    | 0    | **Pro+.** Saves a rule that Adako evaluates once a day against its synced copy of the account — no platform call, no task cost.                           |
| `update_monitor`       | W    | 0    | **Pro+.** Changes a monitor's threshold, rule or on/off state.                                                                                            |
| `list_monitors`        | R    | 0    | Lists every monitor with its rule, whether it is on, when it last ran and when it last fired.                                                             |
| `get_monitor_history`  | R    | 0    | Returns one row per day the monitor was evaluated: the value, the baseline, whether the rule held and whether an alert was sent.                          |
| `test_monitor`         | R    | 0    | Runs a monitor — a saved one, or one described inline — against the synced data for each of the last 7 days and says which days it would have alerted on. |
| `delete_monitor`       | D    | 0    | Removes a monitor and its evaluation history for good.                                                                                                    |
| `list_pending_actions` | R    | 0    | Lists the proposals that monitors created when they fired: which monitor, which day, what it wants to change, and when it expires.                        |
| `manage_action`        | D    | 0    | Applies or declines one proposal that a monitor created.                                                                                                  |

### Briefs and reports (5)

| Tool                    | Risk | Cost | When to use                                                                                                             |
| ----------------------- | ---- | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| `schedule_brief`        | W    | 0    | **Pro+.** Sets up a daily or weekly brief composed from Adako's synced data and emailed to the operator.                |
| `generate_report_now`   | W    | 0    | **Pro+.** Composes a report from Adako's synced data and stores it, so it also has a permanent web page.                |
| `list_scheduled_tasks`  | R    | 0    | Lists every recurring brief or report with its cadence, delivery address, last run and next run.                        |
| `manage_scheduled_task` | W    | 0    | Pauses, resumes or deletes a recurring brief.                                                                           |
| `list_reports`          | R    | 0    | Lists reports — scheduled briefs and on-demand ones — newest first, with the period each covers and a link to its page. |

## Google Ads: 70 tools

Routers: `google_ads` for R, `google_ads_write` for W and D. Account argument: `customer_id`.

### Structure (4)

| Tool                            | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_list_campaigns`         | R    | 0    | Lists the campaigns in a Google Ads account with their state, campaign type, bidding strategy, daily budget (shared or not) and last-30-day spend, clicks and conversions.                   |
| `google_get_campaign_structure` | R    | 0    | Returns the inside of one campaign: its ad groups, the keywords in each (text, match type, state, quality score) and the responsive search ads (headlines, descriptions, display paths, fin… |
| `google_get_ad_creative`        | R    | 0    | Returns the actual copy of responsive search ads: every headline and description, the display paths, the final URLs, the ad strength and Google's approval status.                           |
| `google_list_asset_groups`      | R    | 0    | Lists the asset groups in the account or in one Performance Max campaign, with their status, final URL and the ad strength Google assigns.                                                   |

### Performance (5)

| Tool                                       | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_get_campaign_performance` (direct) | R    | 0    | Reports spend, impressions, clicks, CTR, conversions, conversion value, CPA and ROAS per campaign for a period, plus the change against the immediately preceding period of the same length. |
| `google_get_ad_group_performance`          | R    | 0    | Reports spend, clicks, CTR, conversions, CPA and ROAS per ad group for a period, optionally inside one campaign, ordered by spend.                                                           |
| `google_get_ad_performance`                | R    | 0    | Reports spend, clicks, CTR, conversions, CPA and ROAS for each ad, next to the immediately preceding period of the same length so the direction is visible.                                  |
| `google_get_asset_group_performance`       | R    | 0    | Reports spend, clicks, conversions, CPA and ROAS per Performance Max asset group for the period.                                                                                             |
| `google_get_device_performance`            | R    | 0    | Splits spend, clicks, conversions, CPA and ROAS by device (mobile, desktop, tablet) for the period, next to the previous period of the same length.                                          |

### Keywords (7)

| Tool                                | Risk | Cost | When to use                                                                                                                  |
| ----------------------------------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| `google_get_keyword_performance`    | R    | 0    | Reports the highest-spending keywords for a period with match type, state, quality score, clicks, conversions, CPA and ROAS. |
| `google_add_keywords`               | W    | 1    | Adds keywords to one existing ad group, with an optional max CPC per keyword.                                                |
| `google_add_negative_keywords`      | W    | 1    | Blocks queries from triggering ads anywhere in one campaign.                                                                 |
| `google_update_keyword`             | D    | 1    | Pauses, re-enables or re-bids one keyword.                                                                                   |
| `google_remove_negative_keywords`   | D    | 1    | Deletes negative keywords from a campaign so those queries can trigger ads again.                                            |
| `google_bulk_update_keyword_status` | D    | 1    | Pauses or enables up to 300 keywords in one call.                                                                            |
| `google_bulk_update_keyword_bids`   | D    | 1    | Sets the maximum CPC on up to 300 keywords in one call.                                                                      |

### Analysis (7)

| Tool                                 | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_analyze_search_terms`        | R    | 0    | Reads the actual queries people typed before an ad showed, then sorts them into three buckets: converting (at least one conversion), wasted (spend above the threshold with no conversions)… |
| `google_analyze_wasted_spend`        | R    | 0    | Finds keywords, and the campaigns they sit in, that spent real money over the period and recorded zero conversions.                                                                          |
| `google_explain_performance_anomaly` | R    | 0    | Decomposes a period-over-period change in one metric across campaigns, devices, networks, countries and search terms, and ranks the segments by how much of the total change each one accou… |
| `google_optimize_budget_allocation`  | R    | 0    | Produces a **plan** for moving budget between campaigns, based on what each one currently returns and whether it is actually budget-limited.                                                 |
| `google_get_geo_performance`         | R    | 0    | Splits spend, clicks, conversions, CPA and ROAS by country for the period, using Google's geographic report.                                                                                 |
| `google_get_hourly_performance`      | R    | 0    | Splits performance by hour of day and by day of week, in the account timezone.                                                                                                               |
| `google_get_benchmark_context`       | R    | 0    | Returns indicative Google Search medians — click-through rate, cost per click and landing-page conversion rate — for an industry.                                                            |

### Targeting (6)

| Tool                               | Risk | Cost | When to use                                                                                                                                                                       |
| ---------------------------------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_get_campaign_targeting`    | R    | 0    | Shows who and where a campaign is targeting: locations (with the resolved place names and any exclusions), languages, ad schedule, device bid adjustments and attached audiences. |
| `google_list_languages`            | R    | 0    | Returns Google's language constant ids, which google_update_campaign_languages needs.                                                                                             |
| `google_update_campaign_locations` | D    | 1    | Adds or removes the locations a campaign targets.                                                                                                                                 |
| `google_update_campaign_languages` | D    | 1    | Replaces the set of languages a campaign targets.                                                                                                                                 |
| `google_get_ad_schedule`           | R    | 0    | Returns the campaign's ad schedule: which days and hours it may serve, and the bid modifier on each block.                                                                        |
| `google_set_ad_schedule`           | D    | 1    | Replaces a campaign's whole ad schedule with the blocks you pass.                                                                                                                 |

### Conversions (4)

| Tool                                       | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_list_conversion_actions`           | R    | 0    | Lists the conversion actions set up on the account: name, state, category, how each one counts (every conversion or one per click), whether it is included in the "Conversions" column, and… |
| `google_get_conversion_action_performance` | R    | 0    | Reports, per conversion action, how many conversions it recorded in the period, their value, and whether it counts towards the "Conversions" column that Smart Bidding optimises against.    |
| `google_update_conversion_action`          | D    | 1    | Changes one conversion action: its status, category, counting type, default value, click-through window, or whether it counts towards the Conversions column.                                |
| `google_create_conversion_action`          | W    | 1    | Creates a website (WEBPAGE) conversion action so the account can record a goal.                                                                                                              |

### Research (3)

| Tool                       | Risk | Cost | When to use                                                                                                                                                                                  |
| -------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_research_keywords` | R    | 0    | Asks Google Keyword Planner for keyword ideas from seed terms or a landing page, and returns average monthly searches, competition and the top-of-page bid range for each.                   |
| `google_resolve_locations` | R    | 0    | Converts place names ("Berlin", "California", "United Kingdom") into the numeric geo target constant ids the write tools require.                                                            |
| `google_validate_ad_copy`  | R    | 0    | Checks headlines, descriptions and display paths against the responsive search ad rules before anything is sent to Google: at most 15 headlines of 30 characters, at most 4 descriptions of… |

### Creation (3)

| Tool                                 | Risk | Cost | When to use                                                                                                                                                                                   |
| ------------------------------------ | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_create_search_campaign`      | W    | 1    | Creates a complete Search campaign in one atomic operation: daily budget, campaign, location and language targeting, ad groups, keywords, one responsive search ad per ad group and optiona…  |
| `google_create_responsive_search_ad` | W    | 1    | Creates one responsive search ad inside an existing ad group.                                                                                                                                 |
| `google_create_pmax_campaign`        | D    | 1    | Creates a whole Performance Max campaign in one atomic change: budget, campaign, location targeting, asset group, every text and image asset, and optional search themes and audience signal. |

### Management (16)

| Tool                              | Risk | Cost | When to use                                                                                                                                                                  |
| --------------------------------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_update_campaign_budget`   | D    | 1    | Changes the average daily budget attached to one campaign.                                                                                                                   |
| `google_update_campaign`          | D    | 1    | Changes a campaign's name, on/off state, end date or Search-partner setting.                                                                                                 |
| `google_pause_campaign`           | D    | 1    | Stops a live campaign from serving.                                                                                                                                          |
| `google_resume_campaign`          | W    | 1    | Turns a paused campaign back on.                                                                                                                                             |
| `google_pause_ad_group`           | D    | 1    | Stops one ad group inside a campaign from serving, leaving the rest of the campaign running.                                                                                 |
| `google_resume_ad_group`          | W    | 1    | Turns a paused ad group back on.                                                                                                                                             |
| `google_update_bid_strategy`      | D    | 1    | Changes how a campaign bids: maximise conversions (optionally with a target CPA), maximise conversion value (optionally with a target ROAS), maximise clicks, or manual CPC. |
| `google_list_bidding_strategies`  | R    | 0    | Lists the portfolio (shared) bidding strategies in the account, their type, their target and how many campaigns use each one.                                                |
| `google_pause_ad`                 | D    | 1    | Stops one ad from serving, leaving the rest of the ad group running.                                                                                                         |
| `google_resume_ad`                | W    | 1    | Turns a paused ad back on.                                                                                                                                                   |
| `google_update_campaign_networks` | D    | 1    | Turns a Search campaign's two extra networks on or off: Google search partners (other search sites) and display expansion (the Display Network with leftover budget).        |
| `google_set_device_bid_modifiers` | D    | 1    | Sets the bid multiplier for phones, computers and tablets on one campaign.                                                                                                   |
| `google_list_labels`              | R    | 0    | Lists the labels defined in the account and the campaigns and ad groups each one is applied to.                                                                              |
| `google_create_label`             | W    | 1    | Creates a label in the account.                                                                                                                                              |
| `google_apply_label`              | W    | 1    | Applies an existing label to campaigns and/or ad groups.                                                                                                                     |
| `google_remove_label`             | D    | 1    | Removes the link between a label and the campaigns or ad groups you list.                                                                                                    |

### Assets (10)

| Tool                                 | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_list_assets`                 | R    | 0    | Lists the assets (extensions) that exist in the account and which campaigns or ad groups they are linked to.                                                                                 |
| `google_add_sitelinks`               | W    | 1    | Creates sitelink assets and links them to the account, a campaign or an ad group.                                                                                                            |
| `google_add_callouts`                | W    | 1    | Creates callout assets — short, non-clickable phrases such as "Free shipping" or "Cancel anytime" — and links them to the account, a campaign or an ad group.                                |
| `google_add_structured_snippets`     | W    | 1    | Creates a structured snippet asset — a fixed header such as "Types" or "Brands" followed by 3–10 values — and links it to the account, a campaign or an ad group.                            |
| `google_add_call_asset`              | W    | 1    | Creates a call asset — a phone number shown next to the ad — and links it to the account, a campaign or an ad group.                                                                         |
| `google_set_business_name`           | W    | 1    | Creates a text asset holding the business name and links it as the BUSINESS_NAME asset of a campaign (or of the account).                                                                    |
| `google_add_image_assets`            | W    | 1    | Downloads images from https URLs, checks them against Google's rules (PNG/JPEG/static GIF, at most 5120 KB, the aspect ratio and minimum size of the slot they are for) and uploads the one… |
| `google_remove_asset_links`          | D    | 1    | Removes the link between an asset and a campaign, ad group or the account, so the extension stops serving there.                                                                             |
| `google_validate_and_prepare_assets` | R    | 0    | Checks assets against Google's published rules without writing anything: image URLs are downloaded and measured (format, file size, dimensions, aspect ratio for the slot), text is length-… |
| `google_get_asset_performance`       | R    | 0    | Returns Google's per-asset performance labels for responsive search ads — BEST, GOOD, LOW, LEARNING or PENDING — for each headline and description, with the impressions behind them.        |

### Audiences (5)

| Tool                          | Risk | Cost | When to use                                                                                                                                                                             |
| ----------------------------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_get_search_themes`    | R    | 0    | Lists the signals on a Performance Max asset group: the search themes and the audience signals, with Google's approval status for each.                                                 |
| `google_add_search_themes`    | W    | 1    | Adds search themes to a Performance Max asset group.                                                                                                                                    |
| `google_remove_search_themes` | D    | 1    | Removes search themes from a Performance Max asset group.                                                                                                                               |
| `google_add_audience_signal`  | W    | 1    | Adds an audience as a signal on a Performance Max asset group.                                                                                                                          |
| `google_search_audiences`     | R    | 0    | Finds audiences usable in this account: the account's own audiences and remarketing/customer lists, plus Google's in-market and affinity interest segments when you pass a search term. |

## Meta Ads: 44 tools

Routers: `meta_ads` for R, `meta_ads_write` for W and D. Account argument: `ad_account_id`.

### Structure (5)

| Tool                             | Risk | Cost | When to use                                                                                                                                                                         |
| -------------------------------- | ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_list_campaigns`            | R    | 0    | Lists the campaigns in a Meta ad account with objective, delivery status, budget (as a decimal in the account currency), bid strategy and any Advantage+ state the account exposes. |
| `meta_list_ad_sets`              | R    | 0    | Lists ad sets with budget, optimisation goal, billing event, a one-line targeting summary, schedule and learning-phase state.                                                       |
| `meta_list_ads`                  | R    | 0    | Lists individual ads with delivery status, the creative behind each one and a preview link the user can open.                                                                       |
| `meta_list_lead_forms`           | R    | 0    | Lists the instant (lead gen) forms attached to the Pages this ad account can advertise from, with how many leads each has collected and what it asks for.                           |
| `meta_get_lead_form_submissions` | R    | 0    | Reads the submissions of one lead form: when each lead arrived, which ad and campaign produced it, and the answers given.                                                           |

### Performance (3)

| Tool                                     | Risk | Cost | When to use                                                                                                                                                                                  |
| ---------------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_get_campaign_performance` (direct) | R    | 0    | Campaign-level results for a window, next to the same-length window before it, with the KPI each campaign's objective is actually judged on: purchases and purchase ROAS for sales, leads a… |
| `meta_get_adset_performance`             | R    | 0    | Ad-set level results with the objective's own KPI and a previous-period comparison, optionally split by a breakdown (age and gender, publisher platform and position, device, or country).   |
| `meta_get_ad_performance`                | R    | 0    | Ad-level results joined with the creative behind each ad (creative name and thumbnail), plus the previous-period comparison.                                                                 |

### Analysis (6)

| Tool                           | Risk | Cost | When to use                                                                                                                                                                                 |
| ------------------------------ | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_analyze_wasted_spend`    | R    | 0    | Finds ad sets that spent money and produced no results in the window, and ad sets whose cost per result is far above the account's own average.                                             |
| `meta_detect_creative_fatigue` | R    | 0    | Compares the first days of a window with the last days, per ad, and flags creative fatigue: click-through rate falling while frequency and CPM rise.                                        |
| `meta_get_audience_insights`   | R    | 0    | Splits spend and results by one audience dimension: age, gender, age and gender together, country, region, platform, device or placement position.                                          |
| `meta_analyze_audiences`       | R    | 0    | Ranks the segments of one audience dimension against the account average on the metric that matches the objective: ROAS where revenue exists, otherwise cost per result.                    |
| `meta_optimize_placements`     | R    | 0    | Breaks spend and results down by placement (platform and position) and says which placements cost far more per result than the account average.                                             |
| `meta_optimize_budget`         | R    | 0    | Compares the ad sets in a campaign (or the whole account) on cost per result — or ROAS where revenue exists — and produces a reallocation plan: which budgets to raise, which to lower, by… |

### Targeting (4)

| Tool                                | Risk | Cost | When to use                                                                                                                                                                                  |
| ----------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_search_targeting`             | R    | 0    | Turns a plain-language audience description into the ids Meta's write endpoints require: interest ids, behaviour ids, and location keys for countries, regions, cities, postcodes and media… |
| `meta_get_ad_set_delivery_estimate` | R    | 0    | Asks Meta how many people an ad set's current targeting could reach, and how many of them are reachable daily at the ad set's optimisation goal.                                             |
| `meta_get_ad_set_targeting`         | R    | 0    | Renders one ad set's targeting exactly as Meta holds it: locations, age, gender, detailed targeting, custom audiences, placements, devices and the Advantage+ audience setting.              |
| `meta_browse_targeting`             | R    | 0    | Walks Meta's targeting catalogue by category — interests, behaviours, demographics, life events, industries — instead of searching for a word.                                               |

### Assets (5)

| Tool                           | Risk | Cost | When to use                                                                                                                                                     |
| ------------------------------ | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_list_pages`              | R    | 0    | Lists the Facebook Pages this ad account may advertise from, with any Instagram account linked to each one.                                                     |
| `meta_get_ad_creatives`        | R    | 0    | Lists the creatives used by one ad, or by every ad in an ad set: headline, primary text, destination link, format and thumbnail.                                |
| `meta_list_instagram_accounts` | R    | 0    | Lists the Instagram accounts this ad account may use as the ad's identity, both the ones linked directly to the ad account and the ones connected to its Pages. |
| `meta_list_promotable_apps`    | R    | 0    | Lists the mobile apps registered to this ad account's business that can be advertised, with their store URLs.                                                   |
| `meta_list_media`              | R    | 1    | Lists the images and videos already in the ad account, with the image hash or video id to pass instead of a URL — the way in for a file with no public link.    |

### Conversions (1)

| Tool               | Risk | Cost | When to use                                                                                                                                                 |
| ------------------ | ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_list_pixels` | R    | 0    | Lists the pixels on the ad account with the time each one last received an event, and the standard events it has recently recorded where Meta exposes them. |

### Audiences (2)

| Tool                         | Risk | Cost | When to use                                                                                                                                          |
| ---------------------------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_list_custom_audiences` | R    | 0    | Lists the saved custom and lookalike audiences on the ad account with their type, approximate size and whether Meta considers them usable right now. |
| `meta_list_saved_audiences`  | R    | 0    | Lists the saved audiences in the ad account: the reusable targeting definitions someone built in Ads Manager, with their size estimate.              |

### Diagnostics (2)

| Tool                         | Risk | Cost | When to use                                                                                                                                                                 |
| ---------------------------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_validate_creative_url` | R    | 0    | Fetches a public image URL and reports whether it is reachable, what type and size it is, and its pixel dimensions, then checks any ad copy against Meta's length guidance. |
| `meta_explain_anomaly`       | R    | 0    | Compares a window with the equally long window before it and attributes the change to the ad sets, placements, countries or age-and-gender groups that caused it.           |

### Creation (7)

| Tool                               | Risk | Cost | When to use                                                                                                                                                   |
| ---------------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_create_image_campaign`       | W    | 3    | Builds a complete single-image campaign: campaign, one ad set, the image upload, the creative and one ad.                                                     |
| `meta_create_video_campaign`       | W    | 3    | Builds a complete single-video campaign: campaign, one ad set, the video upload, the creative and one ad.                                                     |
| `meta_create_carousel_campaign`    | W    | 3    | Builds a complete carousel campaign: campaign, one ad set, one image upload per card, the creative and one ad.                                                |
| `meta_create_app_install_campaign` | W    | 3    | Builds a complete app-install campaign: campaign, one ad set pointed at the right operating system, the image upload, the creative and one ad.                |
| `meta_create_flexible_ad`          | W    | 2    | Creates one ad that carries several primary texts, headlines, descriptions and images; Meta assembles the combinations and learns which one works per person. |
| `meta_add_ad_set`                  | W    | 2    | Creates one new ad set, PAUSED, inside a campaign that already exists: its own audience, optimisation goal, budget and schedule.                              |
| `meta_add_ad`                      | W    | 2    | Creates one ad, PAUSED, inside an ad set that already exists.                                                                                                 |

### Management (9)

| Tool                          | Risk | Cost | When to use                                                                                                                                                                        |
| ----------------------------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta_update_adset_budget`    | D    | 1    | Changes the daily or lifetime budget of one ad set.                                                                                                                                |
| `meta_pause_entity`           | D    | 1    | Stops delivery on one campaign, ad set or ad by setting its status to PAUSED.                                                                                                      |
| `meta_resume_entity`          | W    | 1    | Sets one campaign, ad set or ad back to ACTIVE so it can deliver again.                                                                                                            |
| `meta_update_campaign`        | W    | 1    | Changes a campaign's name, status or lifetime spend cap.                                                                                                                           |
| `meta_update_ad_set`          | D    | 1    | Changes one ad set's targeting, optimisation goal, schedule or name.                                                                                                               |
| `meta_update_ad`              | W    | 1    | Changes one ad's name, status, creative or tracking parameters (url_tags).                                                                                                         |
| `meta_update_campaign_budget` | D    | 1    | Changes the daily or lifetime budget held at campaign level, which is how campaign budget optimisation (CBO) campaigns are funded: Meta distributes one budget across the ad sets. |
| `meta_set_frequency_cap`      | W    | 1    | Limits how often one person may see the ads in a reach-optimised ad set: at most max_frequency impressions every interval_days.                                                    |
| `meta_duplicate_campaign`     | W    | 3    | Copies one campaign with Meta's own duplication, always PAUSED and always renamed with a suffix so the two are never confused.                                                     |

## ChatGPT Ads: 23 tools

Routers: `chatgpt_ads` for R, `chatgpt_ads_write` for W and D. Account argument: `ad_account_id`.

### Discovery (2)

| Tool                         | Risk | Cost | When to use                                                                                                                                                                                 |
| ---------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatgpt_get_account`        | R    | 0    | Reads the advertiser account the stored key belongs to: id, name, website, currency, timezone, account status and the platform's review verdict on the account.                             |
| `chatgpt_get_account_limits` | R    | 0    | Lists what this advertiser account supports: the campaign objectives, what the platform can bid towards, what it bills on, the minimum spend limit, the chat card and image rules, and the… |

### Structure (3)

| Tool                     | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatgpt_list_campaigns` | R    | 0    | Lists the campaigns in the advertiser account with status, objective, what the platform bids towards, the lifetime and daily spend limits as decimals in the account currency, the schedule… |
| `chatgpt_list_ad_groups` | R    | 0    | Lists ad groups with status, bidding configuration (what the account is billed on, the strategy, and any fixed maximum bid as a decimal in the account currency), the free-text context hin… |
| `chatgpt_list_ads`       | R    | 0    | Lists individual ads with their status, the chat card behind each one (title, body, destination) and — most usefully — the platform's review verdict and reason.                             |

### Conversions (2)

| Tool                         | Risk | Cost | When to use                                                                                                                                                                                  |
| ---------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatgpt_list_pixels`        | R    | 0    | Lists the measurement pixels on the advertiser account, when each last received an event, and whether a Conversions API key exists for it.                                                   |
| `chatgpt_get_pixel_settings` | R    | 0    | Reads one pixel in detail: when it last received an event, whether a Conversions API key exists, and the conversion event settings on it — the ids a conversions campaign optimises towards. |

### Performance (1)

| Tool                               | Risk | Cost | When to use                                                                                                                                                                                  |
| ---------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatgpt_get_performance` (direct) | R    | 0    | Reports impressions, clicks, spend, conversions and the ratios derived from them (CTR, CPC, CPM, CPA, ROAS) for a window, broken down by campaign, ad group or ad — and compares every numb… |

### Targeting (1)

| Tool                 | Risk | Cost | When to use                                                       |
| -------------------- | ---- | ---- | ----------------------------------------------------------------- |
| `chatgpt_geo_lookup` | R    | 0    | Turns a place name into the location ids the platform targets by. |

### Assets (1)

| Tool                         | Risk | Cost | When to use                                                                                                                                                                                  |
| ---------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatgpt_validate_chat_card` | R    | 0    | Checks a chat card against the rules before anything is created: the headline is 3–50 characters, the body at most 100, the destination an https URL of at most 2048 characters, and the im… |

### Creation (3)

| Tool                      | Risk | Cost | When to use                                                                                                                             |
| ------------------------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `chatgpt_launch_ad`       | W    | 8    | Builds a complete, paused campaign on ChatGPT Ads: campaign, ad group, image upload and one chat card ad.                               |
| `chatgpt_create_ad_group` | W    | 2    | Adds one paused ad group to a campaign that already exists, with its own bidding configuration and optional context hints.              |
| `chatgpt_create_ad`       | W    | 3    | Adds one paused chat card ad to an ad group that already exists: the image is downloaded, checked and uploaded, then the ad is created. |

### Management (10)

| Tool                       | Risk | Cost | When to use                                                                                                                                                                            |
| -------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatgpt_update_campaign`  | W    | 1    | Changes a campaign's name, status or spend limits.                                                                                                                                     |
| `chatgpt_update_ad_group`  | W    | 1    | Changes an ad group's name, bidding or context hints, and — because geo targeting is a campaign setting on this platform — optionally the locations the whole parent campaign runs in. |
| `chatgpt_update_ad`        | W    | 1    | Changes the headline, body copy or destination URL on an existing chat card.                                                                                                           |
| `chatgpt_pause_campaign`   | D    | 1    | Stops delivery on one campaign by setting it to paused.                                                                                                                                |
| `chatgpt_resume_campaign`  | W    | 1    | Sets one campaign back to active so it can deliver again.                                                                                                                              |
| `chatgpt_pause_ad_group`   | D    | 1    | Stops delivery on one ad group without touching the rest of the campaign.                                                                                                              |
| `chatgpt_resume_ad_group`  | W    | 1    | Sets one ad group back to active so it can deliver again.                                                                                                                              |
| `chatgpt_pause_ad`         | D    | 1    | Stops delivery on one ad and leaves everything around it running.                                                                                                                      |
| `chatgpt_resume_ad`        | W    | 1    | Sets one ad back to active so it can be shown again, inside whatever its ad group and campaign are doing.                                                                              |
| `chatgpt_archive_campaign` | D    | 1    | Archives one campaign permanently.                                                                                                                                                     |

## TikTok Ads: 30 tools

Routers: `tiktok_ads` for R, `tiktok_ads_write` for W and D. Account argument: `advertiser_id`.

### Structure (4)

| Tool                          | Risk | Cost | When to use                                                                                                                                                                                  |
| ----------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_list_campaigns`       | R    | 0    | Lists the campaigns in a TikTok advertiser account with objective, on/off state, budget and budget mode, and the delivery status TikTok computed for each one.                               |
| `tiktok_get_campaign_details` | R    | 0    | Reads one campaign together with every ad group under it: objective, budget and mode, and per ad group the optimisation goal, billing event, bid, schedule, placements and targeting (locat… |
| `tiktok_list_ad_groups`       | R    | 0    | Lists ad groups with their on/off state, TikTok's delivery status, budget and mode, optimisation goal, billing event, bid and schedule.                                                      |
| `tiktok_list_ads`             | R    | 0    | Lists individual ads with their on/off state, delivery status, the video and cover images behind each one, the ad text and call to action, the destination URL and — most usefully — TikTok… |

### Performance (3)

| Tool                                       | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_get_campaign_performance` (direct) | R    | 0    | Reports spend, impressions, reach, clicks, conversions and the TikTok video metrics — 2-second and 6-second views, completion, average watch time — per campaign, and compares every number… |
| `tiktok_get_ad_group_performance`          | R    | 0    | Reports the same metrics one level down: per ad group, with the previous-period comparison.                                                                                                  |
| `tiktok_get_ad_performance`                | R    | 0    | Reports per ad: spend, impressions, clicks, conversions and the full set of video metrics, with the previous-period comparison.                                                              |

### Analysis (2)

| Tool                             | Risk | Cost | When to use                                                                                                                                                                  |
| -------------------------------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_get_audience_insights`   | R    | 0    | Breaks spend, impressions, CTR, conversions and CPA down by age, gender, placement, device OS or language for a window.                                                      |
| `tiktok_analyze_geo_performance` | R    | 0    | Breaks spend, impressions, CTR, conversions and CPA down by country for a window, ranked by spend, and flags countries taking meaningful budget with nothing to show for it. |

### Diagnostics (2)

| Tool                             | Risk | Cost | When to use                                                                                                                                                                                 |
| -------------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_analyze_wasted_spend`    | R    | 0    | Lists the ad groups and ads that spent real money over a window and produced no conversions, excluding anything still in its learning period or too thin to judge.                          |
| `tiktok_detect_creative_fatigue` | R    | 0    | Compares the first and second halves of a window per ad and flags the ones whose hook rate, CTR or CPA have moved against them while frequency climbed — the signature of creative fatigue… |

### Targeting (1)

| Tool                      | Risk | Cost | When to use                                                                                                                                                                                 |
| ------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_search_targeting` | R    | 0    | Turns names into the ids TikTok targets by: places into location ids, interest names into interest category ids, keyword phrases into interest keyword ids, languages into language codes,… |

### Discovery (1)

| Tool                       | Risk | Cost | When to use                                                                                                                                                                               |
| -------------------------- | ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_explain_objective` | R    | 0    | Explains what each TikTok campaign objective buys, which optimisation goals and billing events it allows, what it requires before it can be created, and what Adako can build end to end. |

### Conversions (1)

| Tool                 | Risk | Cost | When to use                                                                                                                   |
| -------------------- | ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_list_pixels` | R    | 0    | Lists the pixels on the advertiser account and, for each one, the events it is configured for and when each event last fired. |

### Assets (5)

| Tool                     | Risk | Cost | When to use                                                                                                                                                                                  |
| ------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_list_ad_videos`  | R    | 0    | Lists the videos already uploaded to the advertiser's creative library with their ids, dimensions, duration and file size, and flags any that break TikTok's in-feed rules.                  |
| `tiktok_list_identities` | R    | 0    | Lists the identities this advertiser can run ads as — the handle and avatar a viewer sees on the ad — including the custom identities created in Ads Manager and any TikTok accounts author… |
| `tiktok_list_lead_forms` | R    | 0    | Lists the instant pages and lead forms built on the advertiser account, with their ids and types.                                                                                            |
| `tiktok_validate_assets` | R    | 0    | Checks a video or image URL before anything is uploaded: that it is reachable without a login, that it serves a format TikTok accepts, and that it is inside the size limit — then states t… |
| `tiktok_upload_images`   | W    | 1    | Uploads one or more images to the advertiser's creative library from public URLs and returns their image ids, which tiktok_add_ad and tiktok_create_video_campaign take as the ad's cover.   |

### Creation (3)

| Tool                           | Risk | Cost | When to use                                                                                                                                                      |
| ------------------------------ | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_create_video_campaign` | W    | 3    | Builds a complete TikTok campaign — campaign, one ad group and one in-feed video ad — from a video URL, an existing video id, or an organic post for a Spark Ad. |
| `tiktok_add_ad_group`          | W    | 2    | Creates one more ad group inside an existing TikTok campaign, PAUSED, with its own budget, schedule and targeting.                                               |
| `tiktok_add_ad`                | W    | 2    | Creates one more ad inside an existing TikTok ad group, PAUSED, from a video already in the library or an organic post (Spark Ad).                               |

### Management (8)

| Tool                     | Risk | Cost | When to use                                                                                                                 |
| ------------------------ | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| `tiktok_update_campaign` | W    | 1    | Changes a TikTok campaign's name, daily budget or schedule.                                                                 |
| `tiktok_update_ad_group` | W    | 1    | Changes a TikTok ad group's name, daily budget, bid, schedule or targeting (locations, ages, gender, languages, interests). |
| `tiktok_pause_campaign`  | D    | 1    | Stops delivery on one TikTok campaign by setting its operation status to DISABLE.                                           |
| `tiktok_resume_campaign` | W    | 1    | Sets one TikTok campaign back to ENABLE so it can deliver again.                                                            |
| `tiktok_pause_ad_group`  | D    | 1    | Stops delivery on one TikTok ad group by setting its operation status to DISABLE.                                           |
| `tiktok_resume_ad_group` | W    | 1    | Sets one TikTok ad group back to ENABLE so it can deliver again.                                                            |
| `tiktok_pause_ad`        | D    | 1    | Stops delivery on one TikTok ad by setting its operation status to DISABLE.                                                 |
| `tiktok_resume_ad`       | W    | 1    | Sets one TikTok ad back to ENABLE so it can deliver again.                                                                  |

## LinkedIn Ads: 34 tools

Routers: `linkedin_ads` for R, `linkedin_ads_write` for W and D. Account argument: `ad_account_id`.

### Discovery (2)

| Tool                          | Risk | Cost | When to use                                                                                                                                                                                  |
| ----------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_get_organizations`  | R    | 0    | Lists the LinkedIn organizations (company pages) the connected login administers, with their URNs.                                                                                           |
| `linkedin_explain_objectives` | R    | 0    | Explains LinkedIn's campaign objectives: what each one optimises towards, which ad formats and cost types it allows, when a marketer should pick it, and whether it needs a conversion rule… |

### Structure (4)

| Tool                              | Risk | Cost | When to use                                                                                                                                                          |
| --------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_list_campaign_groups`   | R    | 0    | Lists the campaign groups in the ad account with their status, lifetime budget and run dates.                                                                        |
| `linkedin_list_campaigns`         | R    | 0    | Lists campaigns with their group, status, objective, format, bid, daily and total budget, schedule, audience-expansion settings and a one-line targeting summary.    |
| `linkedin_get_campaign_structure` | R    | 0    | Returns the whole account in one call: every campaign group, the campaigns inside it, and the creatives inside those, with status and budget at each level.          |
| `linkedin_list_creatives`         | R    | 0    | Lists the creatives attached to one or more campaigns, with their intended status, whether they are actually serving, their review verdict and any rejection reason. |

### Performance (2)

| Tool                                         | Risk | Cost | When to use                                                                                                                                                                             |
| -------------------------------------------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_get_campaign_performance` (direct) | R    | 0    | Reports spend, impressions, clicks, CTR, CPC, CPM, leads, cost per lead and website conversions for a window, next to the equally long window before it so every number has a baseline. |
| `linkedin_get_creative_performance`          | R    | 0    | Reports spend, impressions, clicks, CTR, CPC, leads and cost per lead for each creative in a campaign.                                                                                  |

### Briefs and reports (1)

| Tool                              | Risk | Cost | When to use                                                                                                                                                                                  |
| --------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_get_engagement_metrics` | R    | 0    | Reports the social half of LinkedIn delivery: reactions, comments, shares, page follows, total engagements and engagement rate, plus video views and completions where the creative is a vi… |

### Analysis (2)

| Tool                                    | Risk | Cost | When to use                                                                                                                                                                                  |
| --------------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_analyze_creative_performance` | R    | 0    | Ranks a campaign's creatives against each other on CTR and cost per lead, and flags the ones whose CTR fell sharply in the second half of the window — the signature of creative fatigue on… |
| `linkedin_analyze_wasted_spend`         | R    | 0    | Finds campaigns spending without result: impressions with no clicks, clicks with no leads or conversions, and cost per lead well above the account average or a ceiling you give.            |

### Audiences (1)

| Tool                             | Risk | Cost | When to use                                                                                                         |
| -------------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------- |
| `linkedin_get_audience_insights` | R    | 0    | Breaks delivery down by who saw it: job title, industry, seniority, company size, country, job function or company. |

### Targeting (3)

| Tool                                | Risk | Cost | When to use                                                                                                                                                                                  |
| ----------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_search_targeting`         | R    | 0    | Turns plain words into the LinkedIn targeting URNs a campaign actually accepts — job titles, industries, seniorities, company-size bands, locations, skills, interests, member behaviours,…  |
| `linkedin_estimate_audience_size`   | R    | 0    | Counts how many LinkedIn members a targeting spec reaches, before a campaign is created against it.                                                                                          |
| `linkedin_forecast_campaign_supply` | R    | 0    | Asks LinkedIn what a targeting spec is likely to deliver and what the auction currently costs: an impression and click forecast, and the bid range for the objective and cost type you inte… |

### Assets (1)

| Tool                       | Risk | Cost | When to use                                                                                                                                                                                  |
| -------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_validate_assets` | R    | 0    | Checks image URLs against LinkedIn's sponsored-content specs before anything is created: reachable over https, an accepted file type, under the size limit, and either 1.91:1 (1200×627) or… |

### Conversions (3)

| Tool                            | Risk | Cost | When to use                                                                                                                                                                  |
| ------------------------------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_list_conversions`     | R    | 0    | Lists the account's conversion rules with their type, tracking method, attribution windows, assigned value and — most importantly — which campaigns each one is attached to. |
| `linkedin_manage_conversions`   | W    | 1    | Creates a conversion rule on the account, or edits an existing one's name, value, attribution windows or enabled state.                                                      |
| `linkedin_associate_conversion` | W    | 1    | Attaches a conversion rule to a campaign, or detaches it, so LinkedIn reports that conversion against that campaign's spend.                                                 |

### Creation (6)

| Tool                                | Risk | Cost | When to use                                                                                                                                                                                 |
| ----------------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_create_campaign_group`    | W    | 1    | Creates a campaign group — the container every LinkedIn campaign must sit inside, and the place a shared lifetime budget can be set across several campaigns.                               |
| `linkedin_create_image_campaign`    | W    | 1    | Builds a complete single-image sponsored-content campaign: campaign group (reused or created), campaign, image upload, dark post authored by a company page, and the creative — all PAUSED. |
| `linkedin_create_video_campaign`    | W    | 1    | Builds a video sponsored-content campaign: group, campaign, video upload (or an existing video URN), dark post and creative — all PAUSED.                                                   |
| `linkedin_create_carousel_campaign` | W    | 1    | Builds a carousel sponsored-content campaign from two to ten square images, each with its own headline and destination — group, campaign, uploads, dark post and creative, all PAUSED.      |
| `linkedin_create_text_campaign`     | W    | 1    | Creates a TEXT_AD campaign — the small desktop-sidebar unit with a 25-character headline and a 75-character description.                                                                    |
| `linkedin_add_creative`             | W    | 1    | Adds one more creative to an existing campaign — either from a new image URL (uploaded and posted as a dark post) or from a post URN that already exists.                                   |

### Management (9)

| Tool                              | Risk | Cost | When to use                                                                                                                                                                                  |
| --------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkedin_update_campaign`        | W    | 1    | Changes a campaign's name, daily or lifetime budget, bid, run dates, targeting or delivery settings.                                                                                         |
| `linkedin_update_campaign_group`  | W    | 1    | Changes a campaign group's name, lifetime budget, run dates or status.                                                                                                                       |
| `linkedin_batch_update_campaigns` | W    | 1    | Applies one status or one daily budget to up to 50 campaigns at once, reporting each campaign's result separately.                                                                           |
| `linkedin_clone_campaign`         | W    | 1    | Copies an existing campaign's settings — objective, type, format, cost type, bid, budgets, schedule and targeting — into a new **PAUSED** campaign, with optional overrides for name, budge… |
| `linkedin_pause_campaign`         | D    | 1    | Stops delivery on one campaign by setting it to PAUSED.                                                                                                                                      |
| `linkedin_resume_campaign`        | W    | 1    | Sets a campaign to ACTIVE so it can deliver.                                                                                                                                                 |
| `linkedin_pause_creative`         | D    | 1    | Sets one creative to PAUSED so it stops serving while the campaign keeps running on its other creatives.                                                                                     |
| `linkedin_resume_creative`        | W    | 1    | Sets one creative to ACTIVE so it can serve, subject to its campaign's status and LinkedIn's review.                                                                                         |
| `linkedin_delete_creative`        | D    | 1    | Permanently removes a creative from a campaign.                                                                                                                                              |

## Tools that need `confirm_delete: true`

`google_remove_negative_keywords` · `google_remove_asset_links` · `google_remove_search_themes` ·
`google_remove_label` · `linkedin_delete_creative` · `chatgpt_archive_campaign` · `delete_monitor` ·
`manage_scheduled_task` with `action: "delete"`.

Nothing else removes anything. Pause never routes to a delete.
