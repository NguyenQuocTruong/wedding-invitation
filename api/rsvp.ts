import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  InvalidRsvpError,
  RSVP_UNAVAILABLE,
  submitRSVP,
} from '../server/application/submitRSVP.js'
import type { RSVPRepository } from '../server/domain/rsvpRepository.js'
import {
  createGoogleSheetsRepository,
  readGoogleSheetsConfig,
} from '../server/infrastructure/googleSheetsRepository.js'

export type RsvpRequest = Pick<VercelRequest, 'method'> &
  Partial<Pick<VercelRequest, 'headers' | 'body'>>
type RsvpResponse = Pick<VercelResponse, 'setHeader' | 'status' | 'json'>
const MAX_BODY_BYTES = 8192

function header(request: RsvpRequest, key: string): string {
  const value = request.headers?.[key]
  return typeof value === 'string' ? value : ''
}
function sameOrigin(request: RsvpRequest): boolean {
  const origin = header(request, 'origin')
  if (!origin) return true
  try {
    const parsed = new URL(origin)
    return (
      ['https:', 'http:'].includes(parsed.protocol) &&
      parsed.host === header(request, 'host') &&
      parsed.origin === origin
    )
  } catch {
    return false
  }
}

export function createRsvpHandler(repository: RSVPRepository | null) {
  return async (
    request: RsvpRequest,
    response: RsvpResponse,
  ): Promise<void> => {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    if (request.method === 'OPTIONS') {
      response.status(200).json({ enabled: repository !== null })
      return
    }
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST, OPTIONS')
      response.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
      return
    }
    if (!repository) {
      response.status(503).json(RSVP_UNAVAILABLE)
      return
    }
    if (!sameOrigin(request)) {
      response.status(403).json({ error: 'FORBIDDEN' })
      return
    }
    if (
      header(request, 'content-type').split(';')[0]?.trim().toLowerCase() !==
      'application/json'
    ) {
      response.status(415).json({ error: 'UNSUPPORTED_MEDIA_TYPE' })
      return
    }
    if (Number(header(request, 'content-length')) > MAX_BODY_BYTES) {
      response.status(413).json({ error: 'PAYLOAD_TOO_LARGE' })
      return
    }
    let input: unknown
    try {
      const raw =
        typeof request.body === 'string'
          ? request.body
          : JSON.stringify(request.body)
      if (raw === undefined) throw new Error('INVALID_JSON')
      if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
        response.status(413).json({ error: 'PAYLOAD_TOO_LARGE' })
        return
      }
      input = typeof request.body === 'string' ? JSON.parse(raw) : request.body
    } catch {
      response.status(400).json({ error: 'INVALID_JSON' })
      return
    }
    try {
      const result = await submitRSVP(input, repository)
      response.status(200).json(result)
    } catch (error) {
      if (error instanceof InvalidRsvpError) {
        response.status(400).json({ error: 'INVALID_RSVP' })
      } else {
        response.status(503).json({ error: 'RSVP_UNAVAILABLE' })
      }
    }
  }
}

export default async function handler(
  request: RsvpRequest,
  response: RsvpResponse,
): Promise<void> {
  const config = readGoogleSheetsConfig(process.env)
  const repository = config ? createGoogleSheetsRepository(config) : null
  await createRsvpHandler(repository)(request, response)
}
