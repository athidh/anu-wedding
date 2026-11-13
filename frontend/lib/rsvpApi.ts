export interface RsvpPayload {
  name: string
  attending: boolean
  guests?: number
  message?: string
  website?: string
}

export interface RsvpResponse {
  success: boolean
  message: string
  data?: {
    id: string
    name: string
    attending: boolean
    guests: number
    message?: string
    createdAt: string
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'

export async function submitRsvp(payload: RsvpPayload): Promise<RsvpResponse> {
  const res = await fetch(`${API_BASE_URL}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name.trim(),
      attending: payload.attending,
      guests: payload.attending ? (payload.guests ?? 1) : 0,
      message: payload.message?.trim() || '',
      website: payload.website || '',
    }),
  })

  const json = await res.json()

  if (!res.ok) {
    const error = new Error(json.message || 'Failed to submit RSVP') as Error & { status?: number }
    error.status = res.status
    throw error
  }

  return json
}

