import { NextResponse } from 'next/server'

export function jsonOk(data: any) {
    return NextResponse.json(data)
}

export function jsonError(error: string, status = 400) {
    return NextResponse.json({ error }, { status })
}
