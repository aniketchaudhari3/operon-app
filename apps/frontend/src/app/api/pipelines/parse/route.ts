import { NextRequest, NextResponse } from 'next/server'

import { getBackendBaseUrl } from '@/lib/backend-url'

export async function POST(req: NextRequest) {
  let body: string
  try {
    body = await req.text()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(`${getBackendBaseUrl()}/pipelines/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch {
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 502 }
    )
  }

  const payload = await res.text()
  return new NextResponse(payload, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
