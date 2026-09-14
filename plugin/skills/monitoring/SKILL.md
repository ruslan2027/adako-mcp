---
name: monitoring
description: Operating procedure for monitors, alerts, scheduled briefs and reports in Adako, the MCP server and REST API that connects this assistant to Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. Use it whenever the user says "alert me when", "watch this", "let me know if", "send me a weekly summary", "email me a report", or asks what is being watched, why an alert fired, or how to pause a schedule. It covers the 13 monitoring and reporting tools, the metrics and operators a rule accepts, how to test a rule before saving it, how monitor-proposed actions reach the approval inbox, and the plan the tools need.
license: MIT
---

# Monitors, briefs and reports

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This skill covers the watching half:
rules that run once a day on Adako's own copy of the account, briefs by email, and reports on demand.

The 13 tools sit behind two routers. Reads and tests go through `monitoring`. The tools that save,
change or remove something (`create_monitor`, `update_monitor`, `delete_monitor`, `manage_action`,
`schedule_brief`, `generate_report_now`, `manage_scheduled_task`) go through `monitoring_write`:

```
monitoring(action="execute", tool_name="list_monitors", arguments={})
monitoring_write(action="execute", tool_name="create_monitor", arguments={...})
```

`list_tools` and `get_tool_schema` on `monitoring` are free and cover all 13. Never look anything up
through `monitoring_write`.

They cost no tasks. `create_monitor`, `update_monitor`, `schedule_brief` and `generate_report_now`
need the **Pro plan or above**; on Free they return `plan_required` with the upgrade link.

## How it runs

Adako syncs a rolling 90 days of daily metrics per active account and stores a snapshot of every
campaign, ad group and ad. Two daily jobs read it:

- the metric sync at 06:00 UTC, which refreshes the last days and backfills history;
- the monitor pass at 07:00 UTC, which evaluates every enabled monitor against yesterday in the
  account's timezone and sends the briefs that are due.

Evaluation makes no platform call, so a monitor costs nothing and cannot exhaust an account's API
quota. It also means a monitor sees yesterday, not the last hour. Say that when a user expects
minute-level alerting.

Free plans get one 90-day snapshot when an account is connected and no daily refresh, which is why
monitors need Pro.

## Tools

| Tool                    | What it does                                                                     |
| ----------------------- | -------------------------------------------------------------------------------- |
| `create_monitor`        | Saves a rule. Pro.                                                               |
| `update_monitor`        | Changes a threshold, rule or on/off state. Pro.                                  |
| `list_monitors`         | Every monitor with its rule, state, last run and last fire.                      |
| `get_monitor_history`   | One row per evaluated day: value, baseline, whether it held, whether it alerted. |
| `test_monitor`          | Dry run over the last 7 days of synced data. Free, and the right first call.     |
| `delete_monitor`        | Removes a monitor and its history. Needs `confirm_delete: true`.                 |
| `list_pending_actions`  | Proposals that firing monitors created.                                          |
| `manage_action`         | Apply or decline one of those proposals.                                         |
| `schedule_brief`        | Daily or weekly email brief. Pro.                                                |
| `generate_report_now`   | One report now, stored with its own page. Pro.                                   |
| `list_scheduled_tasks`  | Every recurring brief or report, with cadence and next run.                      |
| `manage_scheduled_task` | Pause, resume or delete a schedule. Delete needs `confirm_delete: true`.         |
| `list_reports`          | Reports newest first, with the period each covers.                               |

## Writing a rule

`create_monitor` takes:

- `name`, short and recognisable in an email subject.
- `platform` and optional `account_id`.
- `metric`: `spend`, `clicks`, `impressions`, `conversions`, `conv_value`, `ctr`, `cpc`, `cpa`,
  `cpm`, `roas`, `conversion_rate`, `cost_per_lead`, `budget_utilization`.
- `operator`: `less_than`, `greater_than`, `changes_by`, `drops_by`, `rises_by`.
- `threshold` plus `threshold_type`: `absolute` compares the value with the number; `relative`
  compares it with `baseline × threshold`. The `changes_by`, `drops_by` and `rises_by` operators
  always read the threshold as a percent move against the baseline.
- `baseline_days`: how many days the baseline averages. Default 30, maximum 90.
- `consecutive_days`: how many days in a row the rule must hold before it alerts. Default 1. Use 2 or
  3 for anything noisy; one bad Saturday is not a trend.
- `campaign_ids`, `conditions` (AND / OR), `notify_email`, `enabled`.
- `action`: `pause_campaign` or `lower_budget` with a percent. A monitor with an action must name
  exactly one campaign id, so the proposal it creates names one object.

Never invent a threshold. If the user has not named a metric, a direction and a number, ask.

## The order to work in

1. `list_monitors` so you do not build a duplicate.
2. `test_monitor` with the rule inline. It replays the last 7 days and reports which days would have
   alerted, with the value and the baseline for each.
3. Tune the threshold and `consecutive_days` until it fires on the days the user cares about and
   stays quiet on the rest. This costs nothing, so iterate.
4. `create_monitor`.
5. Later, `get_monitor_history` answers "why did this fire" and "has it ever fired" with real rows.

ROAS monitors are skipped on accounts and objectives that record no revenue. Say so rather than
letting a rule sit silent.

## Actions a monitor proposes

A monitor with an action does not change anything by itself. When it fires it creates a **proposal**,
keyed to that monitor and that day, and the operator approves it like any other write.

- `list_pending_actions` shows which monitor, which day, what it wants to change and when it expires.
- `manage_action` applies or declines one.
- The same proposal appears in `list_pending_proposals` and on the Approvals page.

Quote the diff before applying. A monitor proposing "lower budget 20%" is a suggestion built from
yesterday's numbers, not a decision.

## Briefs and reports

`schedule_brief` takes `cadence` (`daily` or `weekly`), `weekday` for weekly, `hour`, `timezone`
(IANA, for example `Europe/Warsaw`), `platforms`, `account_ids`, `delivery_email` and `report_type`.

- A daily brief compares yesterday with the day before. A weekly one compares the last 7 days with
  the previous 7.
- The job runs once a day, so the hour schedules the day, not the minute: the brief goes out on the
  first daily pass at or after that hour.
- `report_type`: `performance_brief` (totals, per account, top campaigns), `detailed_analysis` (adds
  the biggest movers), `executive_summary` (totals and three lines).

`generate_report_now` composes one report immediately and stores it with a permanent page. Use it
when the user wants something to forward today, not a standing schedule.

`list_scheduled_tasks` shows everything recurring; `manage_scheduled_task` pauses, resumes or deletes
one. Prefer pause: a paused brief keeps its settings and resumes in one call.

## Do not

- Do not promise real-time alerting. Evaluation is daily and looks at yesterday.
- Do not create a monitor without testing it first.
- Do not set a rule on a metric the account cannot record.
- Do not let a monitor's action run without showing the user the diff.
- Do not delete a monitor or a schedule when switching it off is what the user meant.
