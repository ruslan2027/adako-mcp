// @ts-check
/**
 * Argument parsing for the `adako` CLI. Pure functions only — no fs, no fetch, no process — so
 * `./args.test.mjs` can cover the whole surface.
 *
 * Two call styles reach the same REST endpoint:
 *   adako run google_list_campaigns --arg customer_id=1234567890
 *   adako google list-campaigns --customer-id 1234567890
 */

/** Platform words accepted as the first positional of a shortcut, mapped to the tool-name prefix. */
export const PLATFORM_PREFIX = /** @type {const} */ ({
  google: 'google',
  'google-ads': 'google',
  google_ads: 'google',
  meta: 'meta',
  'meta-ads': 'meta',
  meta_ads: 'meta',
  chatgpt: 'chatgpt',
  'chatgpt-ads': 'chatgpt',
  chatgpt_ads: 'chatgpt',
  tiktok: 'tiktok',
  'tiktok-ads': 'tiktok',
  tiktok_ads: 'tiktok',
  linkedin: 'linkedin',
  'linkedin-ads': 'linkedin',
  linkedin_ads: 'linkedin',
})

/** Platform ids the REST API filters on. */
export const PLATFORM_IDS = [
  'google_ads',
  'meta_ads',
  'chatgpt_ads',
  'tiktok_ads',
  'linkedin_ads',
  'system',
]

export const COMMANDS = ['login', 'logout', 'tools', 'schema', 'run', 'help', 'version']

/** Flags the CLI consumes itself; everything else becomes a tool argument. */
export const RESERVED_FLAGS = new Set([
  'raw',
  'json',
  'arg',
  'idempotency-key',
  'key',
  'base-url',
  'platform',
  'help',
  'version',
])

/**
 * `--daily-budget` → `daily_budget`. Tool arguments are always snake_case.
 * @param {string} name
 * @returns {string}
 */
export function kebabToSnake(name) {
  return name.replace(/-/g, '_')
}

/**
 * Ids stay strings even when they are all digits (invariant 4: ids are strings).
 * @param {string} key
 * @returns {boolean}
 */
export function isIdKey(key) {
  return /(^|_)ids?$/.test(key)
}

/**
 * Would JSON.parse give something more useful than the raw string?
 * @param {string} raw
 * @returns {boolean}
 */
export function looksLikeJson(raw) {
  if (raw === 'true' || raw === 'false' || raw === 'null') return true
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(raw)) return true
  const first = raw[0]
  return first === '{' || first === '[' || first === '"'
}

/**
 * Flag value → tool argument value. Numbers, booleans, arrays and objects are parsed; anything else
 * stays a string; id-shaped keys always stay strings.
 * @param {string} key snake_case argument name
 * @param {string | boolean} raw
 * @returns {unknown}
 */
export function coerceValue(key, raw) {
  if (typeof raw !== 'string') return raw
  if (isIdKey(key)) return raw
  if (!looksLikeJson(raw)) return raw
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * Split argv into positional words and flags. Values stay raw; a repeated flag collects into an
 * array; `--no-thing` is `false`; `--` ends flag parsing.
 * @param {string[]} argv
 * @returns {{ positionals: string[], flags: Record<string, string | boolean | Array<string | boolean>> }}
 */
export function parseArgv(argv) {
  /** @type {string[]} */
  const positionals = []
  /** @type {Record<string, string | boolean | Array<string | boolean>>} */
  const flags = {}
  /**
   * @param {string} name
   * @param {string | boolean} value
   */
  const push = (name, value) => {
    const current = flags[name]
    if (current === undefined) flags[name] = value
    else if (Array.isArray(current)) current.push(value)
    else flags[name] = [current, value]
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === undefined) continue
    if (token === '--') {
      for (const rest of argv.slice(i + 1)) positionals.push(rest)
      break
    }
    if (token.startsWith('--') && token.length > 2) {
      const body = token.slice(2)
      const eq = body.indexOf('=')
      if (eq > 0) {
        push(body.slice(0, eq), body.slice(eq + 1))
        continue
      }
      if (body.startsWith('no-') && body.length > 3) {
        push(body.slice(3), false)
        continue
      }
      const next = argv[i + 1]
      if (next === undefined || (next.startsWith('--') && next.length > 2)) {
        push(body, true)
        continue
      }
      push(body, next)
      i += 1
      continue
    }
    positionals.push(token)
  }
  return { positionals, flags }
}

/**
 * Non-reserved flags → tool arguments.
 * @param {Record<string, string | boolean | Array<string | boolean>>} flags
 * @returns {Record<string, unknown>}
 */
export function flagsToArgs(flags) {
  /** @type {Record<string, unknown>} */
  const args = {}
  for (const [name, value] of Object.entries(flags)) {
    if (RESERVED_FLAGS.has(name)) continue
    const key = kebabToSnake(name)
    args[key] = Array.isArray(value)
      ? value.map((entry) => coerceValue(key, entry))
      : coerceValue(key, value)
  }
  return args
}

/**
 * `--arg key=value` (repeatable) → tool arguments.
 * @param {string | boolean | Array<string | boolean> | undefined} value
 * @returns {{ ok: true, args: Record<string, unknown> } | { ok: false, message: string }}
 */
export function parseArgPairs(value) {
  /** @type {Record<string, unknown>} */
  const args = {}
  if (value === undefined) return { ok: true, args }
  const entries = Array.isArray(value) ? value : [value]
  for (const entry of entries) {
    if (typeof entry !== 'string') {
      return { ok: false, message: '--arg needs key=value.' }
    }
    const eq = entry.indexOf('=')
    if (eq <= 0) {
      return { ok: false, message: `--arg ${entry} is not key=value.` }
    }
    const key = kebabToSnake(entry.slice(0, eq))
    args[key] = coerceValue(key, entry.slice(eq + 1))
  }
  return { ok: true, args }
}

/**
 * `--json '{"a":1}'` → an object.
 * @param {string | boolean | Array<string | boolean> | undefined} value
 * @returns {{ ok: true, args: Record<string, unknown> } | { ok: false, message: string }}
 */
export function parseJsonFlag(value) {
  if (value === undefined) return { ok: true, args: {} }
  const raw = Array.isArray(value) ? value[value.length - 1] : value
  if (typeof raw !== 'string') return { ok: false, message: '--json needs a JSON object.' }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, message: '--json is not valid JSON.' }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, message: '--json must be a JSON object.' }
  }
  return { ok: true, args: /** @type {Record<string, unknown>} */ (parsed) }
}

/**
 * `google` + `list-campaigns` → `google_list_campaigns`. Null when the word is not a platform.
 * @param {string} platformWord
 * @param {string} verbObject
 * @returns {string | null}
 */
export function shortcutToolName(platformWord, verbObject) {
  const prefix = /** @type {Record<string, string>} */ (PLATFORM_PREFIX)[platformWord]
  if (!prefix) return null
  const verb = kebabToSnake(verbObject)
  if (!/^[a-z][a-z0-9_]*$/.test(verb)) return null
  return `${prefix}_${verb}`
}

/**
 * `google`, `google-ads` and `google_ads` all mean `google_ads` to `GET /api/v1/tools?platform=`.
 * @param {string} value
 * @returns {string | null}
 */
export function normalisePlatformFilter(value) {
  const snake = kebabToSnake(value)
  if (PLATFORM_IDS.includes(snake)) return snake
  const prefix = /** @type {Record<string, string>} */ (PLATFORM_PREFIX)[value]
  return prefix ? `${prefix}_ads` : null
}

/**
 * @typedef {Object} CliOptions
 * @property {boolean} raw
 * @property {boolean} help
 * @property {string | undefined} key
 * @property {string | undefined} baseUrl
 * @property {string | undefined} idempotencyKey
 * @property {string | undefined} platform
 */

/**
 * @typedef {Object} ParsedCommand
 * @property {'login' | 'logout' | 'tools' | 'schema' | 'run' | 'help' | 'version'} command
 * @property {string | undefined} tool
 * @property {Record<string, unknown>} args
 * @property {CliOptions} options
 */

/**
 * @param {Record<string, string | boolean | Array<string | boolean>>} flags
 * @param {string} name
 * @returns {string | undefined}
 */
function stringFlag(flags, name) {
  const value = flags[name]
  const last = Array.isArray(value) ? value[value.length - 1] : value
  return typeof last === 'string' ? last : undefined
}

/**
 * argv (without node and the script path) → a command.
 * @param {string[]} argv
 * @returns {{ ok: true, value: ParsedCommand } | { ok: false, message: string }}
 */
export function parseCommand(argv) {
  const { positionals, flags } = parseArgv(argv)
  /** @type {CliOptions} */
  const options = {
    raw: flags.raw === true || flags.raw === 'true',
    help: flags.help === true || positionals[0] === 'help',
    key: stringFlag(flags, 'key'),
    baseUrl: stringFlag(flags, 'base-url'),
    idempotencyKey: stringFlag(flags, 'idempotency-key'),
    platform: stringFlag(flags, 'platform'),
  }

  const head = positionals[0]
  if (flags.version === true || head === 'version') {
    return { ok: true, value: { command: 'version', tool: undefined, args: {}, options } }
  }
  if (head === undefined || options.help) {
    return { ok: true, value: { command: 'help', tool: undefined, args: {}, options } }
  }
  if (head === 'login' || head === 'logout') {
    return { ok: true, value: { command: head, tool: undefined, args: {}, options } }
  }
  if (head === 'tools') {
    return { ok: true, value: { command: 'tools', tool: undefined, args: {}, options } }
  }
  if (head === 'schema') {
    const tool = positionals[1]
    if (!tool) return { ok: false, message: 'Usage: adako schema <tool>' }
    return { ok: true, value: { command: 'schema', tool, args: {}, options } }
  }

  let tool
  if (head === 'run') {
    tool = positionals[1]
    if (!tool) return { ok: false, message: 'Usage: adako run <tool> [--arg key=value ...]' }
  } else {
    const verbObject = positionals[1]
    if (!verbObject) {
      return {
        ok: false,
        message: `Unknown command "${head}". Run "adako help", or use "adako <platform> <verb-object>".`,
      }
    }
    tool = shortcutToolName(head, verbObject)
    if (!tool) {
      return {
        ok: false,
        message: `Unknown command "${head}". Platforms: ${Object.keys(PLATFORM_PREFIX).join(', ')}.`,
      }
    }
  }

  const json = parseJsonFlag(flags.json)
  if (!json.ok) return json
  const pairs = parseArgPairs(flags.arg)
  if (!pairs.ok) return pairs

  // --json is the base, plain flags refine it, --arg wins.
  const args = { ...json.args, ...flagsToArgs(flags), ...pairs.args }
  return { ok: true, value: { command: 'run', tool, args, options } }
}
