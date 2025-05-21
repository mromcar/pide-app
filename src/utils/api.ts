import { NextResponse } from 'next/server'

export function jsonOk(data: any) {
  return NextResponse.json({ success: true, ...data })
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}
