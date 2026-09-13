#!/usr/bin/env node
// @ts-check
/**
 * Add Adako to Cursor's MCP configuration, without touching the servers already there.
 *
 *   node install/cursor.mjs                 # ~/.cursor/mcp.json (every project)
 *   node install/cursor.mjs --project       # .cursor/mcp.json in the current directory
 *   node install/cursor.mjs --key ak_live_… # send an API key instead of signing in
 *   node install/cursor.mjs --dry-run       # print the merged file, write nothing
 *
 * Idempotent: running it twice leaves the same file. Other servers are preserved; only the "adako"
 * entry is written. The previous file is kept as mcp.json.bak the first time it changes.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const DEFAULT_URL = 'https://adako.ai/mcp'
const SERVER = 'adako'

function parseArgs(argv) {
  const args = { project: false, dryRun: false, key: null, url: DEFAULT_URL }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--project') args.project = true
    else if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--key') args.key = argv[++i] ?? null
    else if (arg.startsWith('--key=')) args.key = arg.slice('--key='.length)
    else if (arg === '--url') args.url = argv[++i] ?? DEFAULT_URL
    else if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length)
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
      'Usage: node install/cursor.mjs [--project] [--key ak_live_…] [--url URL] [--dry-run]',
    )
    return
  }

  const path = args.project
    ? resolve(process.cwd(), '.cursor', 'mcp.json')
    : join(homedir(), '.cursor', 'mcp.json')

  const config = readJson(path)
  const servers =
    config.mcpServers && typeof config.mcpServers === 'object' && !Array.isArray(config.mcpServers)
      ? config.mcpServers
      : {}

  /** @type {Record<string, unknown>} */
  const entry = { url: args.url }
  if (args.key) entry.headers = { Authorization: `Bearer ${args.key}` }

  const next = { ...config, mcpServers: { ...servers, [SERVER]: entry } }
  const body = `${JSON.stringify(next, null, 2)}\n`

  if (args.dryRun) {
    console.log(`# ${path}`)
    console.log(body)
    return
  }

  mkdirSync(dirname(path), { recursive: true })
  if (existsSync(path) && !existsSync(`${path}.bak`)) copyFileSync(path, `${path}.bak`)
  writeFileSync(path, body)

  const others = Object.keys(servers).filter((name) => name !== SERVER)
  console.log(`Adako written to ${path}`)
  if (others.length) console.log(`Kept: ${others.join(', ')}`)
  console.log(
    args.key
      ? 'Using your API key. Open Cursor Settings, then MCP, and check Adako is listed.'
      : 'Open Cursor Settings, then MCP, and complete the Adako sign-in if prompted.',
  )
  console.log('Then ask: "Using Adako, tell me which ad accounts are connected."')
}

try {
  main()
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
}
