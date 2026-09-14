# Changelog

Adako is an MCP server and REST API that connects Claude, ChatGPT, Cursor and other assistants to
Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads. This file tracks what changed in the
service and in this repository.

## 0.2.1

- **Gemini CLI extension** at the root of this repository:
  `gemini extensions install https://github.com/ruslan2027/adako-mcp`. It adds the server with
  browser sign-in and loads the Adako skill as `GEMINI.md`.
- **Cursor plugin** manifest, `.cursor-plugin/plugin.json`: the server plus the skills.
- Every tool that changes something, in an ad account or in Adako, now carries
  `destructiveHint: true`, creates included. Routers that can only read are marked read-only.
- In ChatGPT, plan and quota messages link the plans page (`plans_url`) instead of an upgrade link.
- New listing title: "Adako: ad ops for AI assistants".

## 0.2.0

Three new ad platforms, a tool surface that scales, a REST API, and daily watching.

### Platforms

- **TikTok Ads**: 30 tools. Campaigns, ad groups and in-feed video ads, Spark Ads, video metrics
  (2-second and 6-second views, completion, watch time), creative fatigue, the objective and
  pixel-event matrix, asset checks before upload.
- **LinkedIn Ads**: 34 tools. Campaign groups, image, video, carousel and text campaigns, B2B
  targeting by title, industry, seniority and company size, audience size and delivery forecasts,
  conversion rules, engagement metrics.
- **ChatGPT Ads**: 23 tools. Chat card campaigns end to end, account limits, pixels and conversion
  event settings, review verdicts.
- **Google Ads** grew to 70 tools: assets and extensions, Performance Max, bid strategies, ads,
  conversion actions, bulk keyword edits, ad schedules, device bid modifiers, labels, geo, hourly
  and device reports, anomaly decomposition, budget reallocation plans, benchmarks.
- **Meta Ads** grew to 43 tools: video, carousel and app-install campaigns, flexible ads, ad sets and
  ads, creative fatigue, audience and placement analysis, budget plans, lead forms and submissions,
  Instagram identities, frequency caps, duplication.

231 tools in total.

### Tool surface

- A client sees 22 entries: 15 tools callable by name plus 7 routers (`google_ads`, `meta_ads`,
  `chatgpt_ads`, `tiktok_ads`, `linkedin_ads`, `monitoring`, `diagnostics`). Everything else is
  reached with `router(action="execute", tool_name="…", arguments={...})`.
- `search_tools` ranks the whole registry against your own wording, across platforms, and returns
  the exact call line. `get_tool_schema` returns arguments. Both free.
- Fan-out: one read across several accounts in a single call, billed per account, capped at 20.
  Writes stay one account at a time.
- Eight quota-free diagnostic tools: campaign specs, draft validation, error explanation, failure
  history, live verification, next actions, a capability menu and a usage summary.

### Automation

- Daily metric sync with 90 days of rolling history, so analysis and alerts do not spend platform
  quota.
- 13 monitoring tools: monitors with baselines and consecutive-day rules, alert emails, scheduled
  briefs, reports on demand, and monitor-proposed actions that still go through approval.
- New pages in the web app: Monitors and Reports.

### Transports

- REST API: `POST /api/v1/tools/{tool_name}/execute` with an API key and an `Idempotency-Key` header,
  plus `GET /api/v1/tools` and `GET /api/v1/openapi.json`.
- The `adako` npm package wraps the same endpoints as a command line for scripts and coding agents.

### This repository

- Eleven Agent Skills in `skills/`: `adako` plus one per platform (`google-ads`, `meta-ads`,
  `tiktok-ads`, `linkedin-ads`, `chatgpt-ads`) and one per job (`launch`, `performance-review`,
  `optimize`, `creative`, `monitoring`).
- `plugin/`: a Claude Code plugin with the MCP server, all eleven skills, an `/adako-setup` command
  and an `adako-operator` agent.
- `install/`: one-file installers for Cursor, Codex and Windsurf. They merge into the client's
  configuration, keep other servers untouched, and are safe to run twice.
- `scripts/sync-skills.mjs` keeps `skills/`, `plugin/skills/` and `SKILL.md` in step with the
  sources.
- New client guides: Cursor, Gemini CLI, VS Code, Windsurf and Perplexity.
- `server.json` now names all five platforms, at version 0.2.0.

### Plans

- Free, Pro, Agency and Enterprise, with active-account limits and monthly tasks. Monitors,
  scheduled briefs and generated reports need Pro or above.

## 0.1.0

The first release: Google Ads and Meta Ads, the proposal engine, paused creation, read-back, the
audit trail, API keys, the Agent Skill, per-client configuration and the docs site.
