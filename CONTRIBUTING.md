# Contributing

This repository holds Adako's public pieces: the Agent Skills, client configuration files, the
one-file installers, the Claude Code plugin and the MCP Registry entry. The server is not open
source, so most changes here are about making Adako easier to install and easier for an assistant to
use well.

## Useful contributions

- A client we do not cover yet, or a corrected config for one we do.
- Fixes to the install steps. If a menu moved, say where it moved to.
- Confirming a page marked **untested**. Tell us the client, the version and what you saw.
- Sharpening a skill in `skills/` where an assistant reliably gets something wrong.
- An installer that fails on a configuration shape we did not anticipate.

## How

1. Open an issue first for anything larger than a typo. It saves you from writing something we cannot
   merge.
2. Fork, branch, change one thing.
3. Open a pull request. Say what you tested and on which client version.

## House style

- Short sentences. Verbs first. No exclamation marks.
- No comparisons to other products, and no other companies' product names.
- No claims we cannot back: no performance numbers, no customer counts.
- Amounts always carry their currency.
- Mark anything you could not test yourself as **untested**.

## Editing a skill

`skills/<name>/SKILL.md` is the copy people install. `plugin/skills/` and `SKILL.md` at the root are
generated from the same sources by `scripts/sync-skills.mjs`, so change one of them in your pull
request and say so; we regenerate the rest before release. A skill's frontmatter `name` must match
its directory, and the sync refuses to run when it does not.

Keep the frontmatter to the Agent Skills fields — `name`, `description`, `license`, `compatibility`,
`metadata`, `allowed-tools`. Anything else breaks the skill when it is uploaded.

## Not here

- Bugs in the hosted service, wrong numbers from a tool, billing: [support@adako.ai](mailto:support@adako.ai).
- Security problems: see [SECURITY.md](SECURITY.md). Do not open an issue.

## Licence

Contributions to this repository are accepted under the MIT terms in [LICENSE](LICENSE).
