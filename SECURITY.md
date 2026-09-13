# Security

## Reporting

Send security reports to **[support@adako.ai](mailto:support@adako.ai)**. Do not open a public
issue.

Include what you found, how to reproduce it, and what an attacker could reach with it. If you have a
proof of concept, attach it. Use your own Adako account and your own ad accounts; do not touch data
that is not yours.

We acknowledge reports within three business days and tell you what we intend to do. We will keep you
updated until it is closed, and we will credit you when it is fixed, unless you prefer otherwise.

## In scope

- `https://adako.ai` — the web application and the MCP endpoint at `/mcp`
- The OAuth authorization server and the API-key path
- The contents of this repository

## Out of scope

- Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and LinkedIn Ads themselves. Report those to the
  platform.
- Reports generated only by an automated scanner, with no demonstrated impact.
- Denial of service, volumetric testing, social engineering, physical access.
- Missing headers or configuration hardening with no path to real impact.

## Please do not

- Run load or stress tests against the service.
- Access, change or delete another user's data, or another advertiser's campaigns.
- Publish a finding before we have had a chance to fix it.

## How Adako handles credentials

- Platform tokens and advertiser API keys are encrypted at rest and are never sent to an AI client.
  The MCP server calls the ad platforms itself.
- API keys are stored hashed. Only the prefix is displayed after creation, and revoking a key takes
  effect within seconds.
- Tool arguments are redacted before they reach logs or the audit trail.
- Every write is recorded, with who approved it and when.

If you believe a key of yours has leaked, revoke it at [adako.ai/keys](https://adako.ai/keys) and
write to [support@adako.ai](mailto:support@adako.ai).
