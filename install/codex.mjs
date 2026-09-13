#!/usr/bin/env node
// @ts-check
/**
 * Add Adako to the Codex CLI configuration, without touching anything else in the file.
 *
 *   node install/codex.mjs                     # ~/.codex/config.toml
 *   node install/codex.mjs --key-env MY_VAR    # a different environment variable for the API key
 *   node install/codex.mjs --oauth             # no bearer line; sign in with `codex mcp login adako`
 *   node install/codex.mjs --dry-run           # print the merged file, write nothing
 *
 * config.toml is hand-edited TOML, so this rewrites one table and leaves the rest of the file byte
 * for byte: the `[mcp_servers.adako]` block is replaced if it exists and appended if it does not.
 * The previous file is kept as config.toml.bak the first time it changes.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const DEFAULT_URL = 'https://adako.ai/mcp'
const TABLE = '[mcp_servers.adako]'

function defaultPath() {
  return join(homedir(), '.codex', 'config.toml')
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    oauth: false,
    keyEnv: 'ADAKO_API_KEY',
    url: DEFAULT_URL,
    path: defaultPath(),
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--oauth') args.oauth = true
    else if (arg === '--key-env') args.keyEnv = argv[++i] ?? 'ADAKO_API_KEY'
    else if (arg.startsWith('--key-env=')) args.keyEnv = arg.slice('--key-env='.length)
    else if (arg === '--url') args.url = argv[++i] ?? DEFAULT_URL
    else if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length)
    else if (arg === '--path') args.path = resolve(argv[++i] ?? defaultPath())
    else if (arg.startsWith('--path=')) args.path = resolve(arg.slice('--path='.length))
    else if (arg === '--help' || arg === '-h') args.help = true
    else throw new Error(`Unknown option: ${arg}`)
  }
  return args
}

/** The lines of the `[mcp_servers.adako]` table, ending with a blank line. */
function block(args) {
  const lines = [TABLE, `url = "${args.url}"`]
  if (!args.oauth) lines.push(`bearer_token_env_var = "${args.keyEnv}"`)
  return `${lines.join('\n')}\n`
}

/**
 * Replace the table if it is already there, otherwise append it. A table ends at the next line that
 * opens another table at column 0, which is all the structure this needs to know about.
 */
function merge(existing, replacement) {
  const lines = existing.split(/\r?\n/)
  const start = lines.findIndex((line) => line.trim() === TABLE)
  if (start === -1) {
    const base = existing.trimEnd()
    return base === '' ? replacement : `${base}\n\n${replacement}`
  }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\[/.test(lines[i])) {
      end = i
      break
    }
  }
  const before = lines.slice(0, start).join('\n').trimEnd()
  const after = lines.slice(end).join('\n').replace(/^\n+/, '')
  const head = before === '' ? '' : `${before}\n\n`
  const tail = after.trim() === '' ? '' : `\n${after.trimEnd()}\n`
  return `${head}${replacement}${tail}`
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(
      'Usage: node install/codex.mjs [--oauth] [--key-env VAR] [--url URL] [--path FILE] [--dry-run]',
    )
    return
  }

  const existing = existsSync(args.path) ? readFileSync(args.path, 'utf8') : ''
  const body = merge(existing, block(args))

  if (args.dryRun) {
    console.log(`# ${args.path}`)
    console.log(body)
    return
  }

  mkdirSync(dirname(args.path), { recursive: true })
  if (existsSync(args.path) && !existsSync(`${args.path}.bak`))
    copyFileSync(args.path, `${args.path}.bak`)
  writeFileSync(args.path, body)

  console.log(`Adako written to ${args.path}`)
  console.log(
    args.oauth
      ? 'Run `codex mcp login adako` and complete the sign-in in your browser.'
      : `Export your API key as ${args.keyEnv}, or run this again with --oauth to sign in instead.`,
  )
  console.log('Then ask: "Using Adako, tell me which ad accounts are connected."')
}

try {
  main()
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
}
