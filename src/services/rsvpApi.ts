import type { RSVPInput } from '../types/rsvp'

export const RSVP_ENDPOINT = '/api/rsvp'

type RsvpErrorCode =
  | 'INVALID_RSVP'
  | 'INVALID_JSON'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RSVP_NOT_CONFIGURED'
  | 'RSVP_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'TIMEOUT'

/** Carries only a known code; remote bodies and network details stay private. */
export class RsvpApiError extends Error {
  constructor(readonly code: RsvpErrorCode) {
    super('Không thể xác nhận kết quả gửi. Vui lòng thử lại.')
    this.name = 'RsvpApiError'
  }
}

const errorStatuses: Partial<Record<RsvpErrorCode, number>> = {
  INVALID_RSVP: 400,
  INVALID_JSON: 400,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RSVP_NOT_CONFIGURED: 503,
  RSVP_UNAVAILABLE: 503,
}

function isSingleField(
  body: unknown,
  field: string,
): body is Record<string, unknown> {
  return (
    typeof body === 'object' &&
    body !== null &&
    !Array.isArray(body) &&
    Object.keys(body).length === 1 &&
    Object.hasOwn(body, field)
  )
}

async function requestJson(
  method: 'OPTIONS' | 'POST',
  input?: RSVPInput & { website?: string },
): Promise<unknown> {
  const controller = new AbortController()
  let timeout: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new RsvpApiError('TIMEOUT'))
      controller.abort()
    }, 20_000)
  })

  try {
    return await Promise.race([
      deadline,
      (async () => {
        const response = await fetch(RSVP_ENDPOINT, {
          method,
          credentials: 'same-origin',
          cache: 'no-store',
          redirect: 'error',
          headers: input
            ? { Accept: 'application/json', 'Content-Type': 'application/json' }
            : { Accept: 'application/json' },
          ...(input ? { body: JSON.stringify(input) } : {}),
          signal: controller.signal,
        })

        let body: unknown
        if (
          response.headers
            .get('Content-Type')
            ?.split(';')[0]
            ?.trim()
            .toLowerCase() === 'application/json'
        ) {
          try {
            body = await response.json()
          } catch {
            // Never include the response body in an error or log.
          }
        }

        if (!response.ok) {
          if (isSingleField(body, 'error') && typeof body.error === 'string') {
            const code = body.error as RsvpErrorCode
            if (
              Object.hasOwn(errorStatuses, code) &&
              errorStatuses[code] === response.status
            ) {
              throw new RsvpApiError(code)
            }
          }
          throw new RsvpApiError('RSVP_UNAVAILABLE')
        }
        return body
      })(),
    ])
  } catch (error) {
    throw error instanceof RsvpApiError
      ? error
      : new RsvpApiError('RSVP_UNAVAILABLE')
  } finally {
    clearTimeout(timeout)
  }
}

export async function getRsvpAvailability(): Promise<boolean> {
  const body = await requestJson('OPTIONS')
  if (!isSingleField(body, 'enabled') || typeof body.enabled !== 'boolean') {
    throw new RsvpApiError('INVALID_RESPONSE')
  }
  return body.enabled
}

export async function sendRsvp(
  input: RSVPInput & { website?: string },
): Promise<void> {
  const body = await requestJson('POST', input)
  if (!isSingleField(body, 'ok') || body.ok !== true) {
    throw new RsvpApiError('INVALID_RESPONSE')
  }
}
