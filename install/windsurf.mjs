#!/usr/bin/env node
// @ts-check
/**
 * Add Adako to Windsurf's MCP configuration, without touching the servers already there.
 *
 *   node install/windsurf.mjs                 # ~/.codeium/windsurf/mcp_config.json
 *   node install/windsurf.mjs --key ak_live_… # send an API key instead of signing in
 *   node install/windsurf.mjs --path FILE     # a different configuration file
 *   node install/windsurf.mjs --dry-run       # print the merged file, write nothing
 *
 * Idempotent: running it twice leaves the same file. Only the "adako" entry is written; everything
 * else is preserved, and the previous file is kept as mcp_config.json.bak the first time it changes.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const DEFAULT_URL = 'https://adako.ai/mcp'
const SERVER = 'adako'

function defaultPath() {
  return join(homedir(), '.codeium', 'windsurf', 'mcp_config.json')
}

function parseArgs(argv) {
  const args = { dryRun: false, key: null, url: DEFAULT_URL, path: defaultPath() }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--key') args.key = argv[++i] ?? null
    else if (arg.startsWith('--key=')) args.key = arg.slice('--key='.length)
    else if (arg === '--url') args.url = argv[++i] ?? DEFAULT_URL
    else if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length)
    else if (arg === '--path') args.path = resolve(argv[++i] ?? defaultPath())
    else if (arg.startsWith('--path=')) args.path = resolve(arg.slice('--path='.length))
    else if (arg === '--help' || arg === '-h') args.help = true
    else throw new Error(`Unknown option: ${arg}`)
  }
  return args
}

function readJson(path) {
  if (!existsSync(path)) return {}
  const text = readFileSync(path, 'utf8').trim()
  if (text === '') return {}
  try {
    const parsed = JSON.parse(text)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('not an object')
    }
    return parsed
  } catch (err) {
    throw new Error(
      `${path} is not valid JSON (${err instanceof Error ? err.message : String(err)}). Fix it or move it aside, then run this again.`,
    )
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(
      'Usage: node install/windsurf.mjs [--key ak_live_…] [--url URL] [--path FILE] [--dry-run]',
    )
    return
  }

  const config = readJson(args.path)
  const servers =
    config.mcpServers && typeof config.mcpServers === 'object' && !Array.isArray(config.mcpServers)
      ? config.mcpServers
      : {}

  /** Windsurf addresses a remote MCP server with `serverUrl`. */
  /** @type {Record<string, unknown>} */
  const entry = { serverUrl: args.url }
  if (args.key) entry.headers = { Authorization: `Bearer ${args.key}` }

  const next = { ...config, mcpServers: { ...servers, [SERVER]: entry } }
  const body = `${JSON.stringify(next, null, 2)}\n`

  if (args.dryRun) {
    console.log(`# ${args.path}`)
    console.log(body)
    return
  }

  mkdirSync(dirname(args.path), { recursive: true })
  if (existsSync(args.path) && !existsSync(`${args.path}.bak`))
    copyFileSync(args.path, `${args.path}.bak`)
  writeFileSync(args.path, body)

  const others = Object.keys(servers).filter((name) => name !== SERVER)
  console.log(`Adako written to ${args.path}`)
  if (others.length) console.log(`Kept: ${others.join(', ')}`)
  console.log(
    'Open Windsurf Settings, then Cascade, then the MCP panel, and refresh the server list.',
  )
  console.log('Then ask: "Using Adako, tell me which ad accounts are connected."')
}

try {
  main()
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
}
