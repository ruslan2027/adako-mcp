// @ts-check
/**
 * Command dispatch and output. Everything that touches the network, the filesystem or stdout lives
 * here; the parsing it relies on is pure and tested in ./args.test.mjs.
 *
 * Exit codes: 0 success, 1 the call failed (the error code and recovery steps go to stderr),
 * 2 the command line itself was wrong.
 */
import { createInterface } from 'node:readline'
import { parseCommand, normalisePlatformFilter } from './args.mjs'
import { apiRequest, CliError, envelopeError } from './client.mjs'
import {
  configPath,
  deleteConfig,
  readConfig,
  resolveApiKey,
  resolveBaseUrl,
  writeConfig,
} from './config.mjs'

export const VERSION = '0.1.0'

const HELP = `adako — the Adako ad-ops tools on the command line.

Adako is an MCP server and REST API for Google Ads, Meta Ads, ChatGPT Ads, TikTok Ads and
LinkedIn Ads. Reads run immediately; writes become proposals you approve.

Usage
  adako login [--key ak_live_...]        Store an API key in ${'$'}XDG_CONFIG_HOME/adako/config.json
  adako logout                           Forget the stored key
  adako tools [--platform google_ads]    List every callable tool
  adako schema <tool>                    Print one tool's JSON Schema
  adako run <tool> [options]             Call a tool by name
  adako <platform> <verb-object> [...]   Shortcut: adako google list-campaigns

Arguments
  --arg key=value           Repeatable. Kebab-case keys become snake_case.
  --json '{"a": 1}'         Whole argument object at once.
  --<flag> <value>          Same as --arg flag=value (adako meta list-ads --ad-account-id act_1)
  Values that look like JSON are parsed; ids always stay strings.

Options
  --idempotency-key <k>     Safe retries: the same key never runs the same write twice.
  --raw                     Print the JSON envelope instead of markdown.
  --key <ak_live_...>       Use this API key for one call.
  --base-url <url>          Point at another deployment.
  --help, --version

Environment
  ADAKO_API_KEY, ADAKO_BASE_URL override the stored config.

Safety
  Every write returns a proposal_id and changes nothing until it is approved — in the web app, or
  with: adako run approve_proposal --arg proposal_id=<id>
`

/**
 * @param {string[]} argv arguments after node and the script path
 * @param {{ stdout?: (line: string) => void, stderr?: (line: string) => void }} [io]
 * @returns {Promise<number>} process exit code
 */
export async function main(argv, io = {}) {
  const out = io.stdout ?? ((line) => process.stdout.write(`${line}\n`))
  const err = io.stderr ?? ((line) => process.stderr.write(`${line}\n`))

  const parsed = parseCommand(argv)
  if (!parsed.ok) {
    err(parsed.message)
    return 2
  }
  const { command, tool, args, options } = parsed.value

  if (command === 'help') {
    out(HELP)
    return 0
  }
  if (command === 'version') {
    out(VERSION)
    return 0
  }

  try {
    const config = readConfig()
    const baseUrl = resolveBaseUrl(options, config)

    if (command === 'logout') {
      out(deleteConfig() ? `Removed ${configPath()}.` : 'No stored key.')
      return 0
    }
    if (command === 'login') {
      return await login(options, baseUrl, out, err)
    }

    const apiKey = requireKey(options, config)

    if (command === 'tools') {
      return await listTools(options, baseUrl, apiKey, out, err)
    }
    if (command === 'schema') {
      return await describeTool(String(tool), baseUrl, apiKey, out)
    }
    return await runTool(String(tool), args, options, baseUrl, apiKey, out, err)
  } catch (error) {
    return reportError(error, err)
  }
}

/**
 * @param {{ key?: string | undefined }} options
 * @param {import('./config.mjs').CliConfig} config
 */
function requireKey(options, config) {
  const apiKey = resolveApiKey(options, config)
  if (!apiKey) {
    throw new CliError('No API key.', {
      code: 'unauthorized',
      recoverySteps: [
        'Run: adako login',
        'Or set ADAKO_API_KEY=ak_live_... in the environment.',
        'Create a key in the Adako web app under API keys.',
      ],
    })
  }
  return apiKey
}

/**
 * @param {import('./args.mjs').CliOptions} options
 * @param {string} baseUrl
 * @param {(line: string) => void} out
 * @param {(line: string) => void} err
 */
async function login(options, baseUrl, out, err) {
  const key = options.key ?? (await promptSecret('Adako API key (ak_live_...): '))
  if (!key || !key.startsWith('ak_')) {
    err('That does not look like an Adako API key (they start with ak_live_).')
    return 2
  }
  const response = await apiRequest({ baseUrl, path: '/api/v1/tools', apiKey: key })
  if (response.status === 401) {
    err('The server rejected that key. Nothing was saved.')
    return 1
  }
  if (response.status >= 400) throw envelopeError(response)

  const path = writeConfig({ api_key: key, base_url: baseUrl })
  const count = /** @type {Record<string, any>} */ (response.body ?? {}).count ?? 0
  out(`Saved to ${path} (owner-only). ${count} tools available at ${baseUrl}.`)
  return 0
}

/**
 * @param {import('./args.mjs').CliOptions} options
 * @param {string} baseUrl
 * @param {string} apiKey
 * @param {(line: string) => void} out
 * @param {(line: string) => void} err
 */
async function listTools(options, baseUrl, apiKey, out, err) {
  let path = '/api/v1/tools'
  if (options.platform) {
    const platform = normalisePlatformFilter(options.platform)
    if (!platform) {
      err(`Unknown platform "${options.platform}".`)
      return 2
    }
    path += `?platform=${encodeURIComponent(platform)}`
  }
  const response = await apiRequest({ baseUrl, path, apiKey })
  if (response.status >= 400) throw envelopeError(response)
  const body = /** @type {Record<string, any>} */ (response.body ?? {})
  if (options.raw) {
    out(JSON.stringify(body, null, 2))
    return 0
  }
  /** @type {Array<Record<string, any>>} */
  const tools = Array.isArray(body.tools) ? body.tools : []
  const width = tools.reduce((max, t) => Math.max(max, String(t.name).length), 0)
  for (const t of tools) {
    const cost = t.cost === 0 ? 'free' : `${t.cost} task${t.cost === 1 ? '' : 's'}`
    out(
      `${String(t.name).padEnd(width)}  ${String(t.risk).padEnd(17)} ${cost.padEnd(8)} ${t.title}`,
    )
  }
  out(`\n${tools.length} tools. Details: adako schema <tool>`)
  return 0
}

/**
 * @param {string} tool
 * @param {string} baseUrl
 * @param {string} apiKey
 * @param {(line: string) => void} out
 */
async function describeTool(tool, baseUrl, apiKey, out) {
  const response = await apiRequest({
    baseUrl,
    path: `/api/v1/tools/${encodeURIComponent(tool)}`,
    apiKey,
  })
  if (response.status >= 400) throw envelopeError(response)
  const body = /** @type {Record<string, any>} */ (response.body ?? {})
  out(JSON.stringify(body.tool ?? body, null, 2))
  return 0
}

/**
 * @param {string} tool
 * @param {Record<string, unknown>} args
 * @param {import('./args.mjs').CliOptions} options
 * @param {string} baseUrl
 * @param {string} apiKey
 * @param {(line: string) => void} out
 * @param {(line: string) => void} err
 */
async function runTool(tool, args, options, baseUrl, apiKey, out, err) {
  const response = await apiRequest({
    baseUrl,
    path: `/api/v1/tools/${encodeURIComponent(tool)}/execute`,
    apiKey,
    method: 'POST',
    body: { arguments: args },
    ...(options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
  })
  const body = /** @type {Record<string, any>} */ (response.body ?? {})

  if (options.raw) {
    out(JSON.stringify(body, null, 2))
    return body.success === true ? 0 : 1
  }
  if (body.success !== true) throw envelopeError(response)

  if (response.replayed) err('(replayed from the idempotency cache — nothing ran again)')
  out(String(body.markdown ?? ''))
  if (typeof body.proposal_id === 'string') {
    err(`\nProposal ${body.proposal_id} is waiting. Nothing has changed yet.`)
    if (typeof body.approve_url === 'string') err(`Approve: ${body.approve_url}`)
    err(`Or: adako run approve_proposal --arg proposal_id=${body.proposal_id}`)
  }
  return 0
}

/**
 * @param {unknown} error
 * @param {(line: string) => void} err
 */
function reportError(error, err) {
  if (error instanceof CliError) {
    err(`Error (${error.code}): ${error.message}`)
    for (const step of error.recoverySteps) err(`  - ${step}`)
    if (error.requestId) err(`  request id: ${error.requestId}`)
    return 1
  }
  err(`Error: ${String(error)}`)
  return 1
}

/**
 * Reads a secret from stdin. Echo is suppressed on a TTY; when stdin is a pipe the value is simply
 * read, which is how CI pipes a key in.
 * @param {string} question
 * @returns {Promise<string>}
 */
function promptSecret(question) {
  return new Promise((resolve) => {
    const isTty = process.stdin.isTTY === true
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: isTty })
    if (isTty) {
      const internal = /** @type {any} */ (rl)
      const write = internal._writeToOutput?.bind(rl)
      internal._writeToOutput = (/** @type {string} */ chunk) => {
        if (chunk.includes(question) && write) write(chunk)
      }
    }
    rl.question(question, (answer) => {
      rl.close()
      if (isTty) process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}
