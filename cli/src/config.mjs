// @ts-check
/**
 * Where the CLI keeps the API key: `$XDG_CONFIG_HOME/adako/config.json`, or `~/.config/adako` when
 * that is unset — the same path on Linux, macOS and Windows so a dotfile sync finds it. The file is
 * written 0600; the directory 0700.
 *
 * `ADAKO_API_KEY` and `ADAKO_BASE_URL` override the file, and `--key` / `--base-url` override both.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const DEFAULT_BASE_URL = 'https://adako.ai'

/** @typedef {{ api_key?: string, base_url?: string }} CliConfig */

export function configDir() {
  const xdg = process.env.XDG_CONFIG_HOME
  const base = xdg && xdg.trim() !== '' ? xdg.trim() : join(homedir(), '.config')
  return join(base, 'adako')
}

export function configPath() {
  return join(configDir(), 'config.json')
}

/** @returns {CliConfig} */
export function readConfig() {
  const path = configPath()
  if (!existsSync(path)) return {}
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return /** @type {CliConfig} */ (parsed)
  } catch {
    return {}
  }
}

/** @param {CliConfig} config */
export function writeConfig(config) {
  const dir = configDir()
  mkdirSync(dir, { recursive: true, mode: 0o700 })
  const path = configPath()
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 })
  try {
    chmodSync(path, 0o600)
  } catch {
    // Windows ignores POSIX modes; the file still inherits the user's ACL.
  }
  return path
}

export function deleteConfig() {
  const path = configPath()
  if (!existsSync(path)) return false
  rmSync(path)
  return true
}

/**
 * @param {{ baseUrl?: string | undefined }} options
 * @param {CliConfig} config
 */
export function resolveBaseUrl(options, config) {
  const value = options.baseUrl ?? process.env.ADAKO_BASE_URL ?? config.base_url ?? DEFAULT_BASE_URL
  return value.replace(/\/$/, '')
}

/**
 * @param {{ key?: string | undefined }} options
 * @param {CliConfig} config
 * @returns {string | null}
 */
export function resolveApiKey(options, config) {
  return options.key ?? process.env.ADAKO_API_KEY ?? config.api_key ?? null
}
