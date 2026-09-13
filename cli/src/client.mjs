// @ts-check
/**
 * The HTTP client: every command is one request to the Adako REST API. No dependencies — global
 * fetch, and the response body is always read so the socket is released.
 */

export class CliError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string, recoverySteps?: string[], requestId?: string }} [options]
   */
  constructor(message, options = {}) {
    super(message)
    this.name = 'CliError'
    this.code = options.code ?? 'cli_error'
    this.recoverySteps = options.recoverySteps ?? []
    this.requestId = options.requestId
  }
}

/**
 * @typedef {Object} ApiResponse
 * @property {number} status
 * @property {unknown} body
 * @property {boolean} replayed
 * @property {string | null} requestId
 */

/**
 * @param {Object} input
 * @param {string} input.baseUrl
 * @param {string} input.path
 * @param {string} input.apiKey
 * @param {'GET' | 'POST'} [input.method]
 * @param {unknown} [input.body]
 * @param {string} [input.idempotencyKey]
 * @returns {Promise<ApiResponse>}
 */
export async function apiRequest(input) {
  const url = `${input.baseUrl}${input.path}`
  /** @type {Record<string, string>} */
  const headers = {
    authorization: `Bearer ${input.apiKey}`,
    accept: 'application/json',
    'user-agent': 'adako-cli',
  }
  if (input.body !== undefined) headers['content-type'] = 'application/json'
  if (input.idempotencyKey) headers['idempotency-key'] = input.idempotencyKey

  let response
  try {
    response = await fetch(url, {
      method: input.method ?? 'GET',
      headers,
      body: input.body === undefined ? undefined : JSON.stringify(input.body),
    })
  } catch (error) {
    throw new CliError(`Could not reach ${input.baseUrl}: ${String(error)}`, {
      code: 'network_error',
      recoverySteps: [
        'Check the network connection.',
        'If you are pointing at a local server, pass --base-url http://localhost:3000.',
      ],
    })
  }

  const text = await response.text()
  let body
  try {
    body = text === '' ? undefined : JSON.parse(text)
  } catch {
    throw new CliError(`${input.baseUrl} did not return JSON (HTTP ${response.status}).`, {
      code: 'bad_response',
      recoverySteps: ['Check --base-url. It must point at the Adako app, not at a proxy.'],
    })
  }

  return {
    status: response.status,
    body,
    replayed: response.headers.get('idempotent-replayed') === 'true',
    requestId: response.headers.get('x-request-id'),
  }
}

/**
 * Turn a failed envelope into a CliError carrying the code and the recovery steps.
 * @param {ApiResponse} response
 * @returns {CliError}
 */
export function envelopeError(response) {
  const body = /** @type {Record<string, any>} */ (response.body ?? {})
  const error = body.error
  if (error && typeof error === 'object') {
    return new CliError(String(error.message ?? 'The call failed.'), {
      code: String(error.code ?? 'internal'),
      recoverySteps: Array.isArray(error.recovery_steps)
        ? error.recovery_steps.map((/** @type {unknown} */ step) => String(step))
        : [],
      requestId: typeof body.request_id === 'string' ? body.request_id : undefined,
    })
  }
  return new CliError(`HTTP ${response.status}.`, {
    code: 'http_error',
    requestId: response.requestId ?? undefined,
  })
}
