import type { VercelRequest, VercelResponse } from '@vercel/node'
import { RSVP_UNAVAILABLE } from '../server/application/submitRSVP.js'

export default function handler(
  request: Pick<VercelRequest, 'method'>,
  response: Pick<VercelResponse, 'setHeader' | 'status' | 'json'>,
): void {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
    return
  }
  response.status(503).json(RSVP_UNAVAILABLE)
}
