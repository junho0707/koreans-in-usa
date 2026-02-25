import { NextResponse } from 'next/server';

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
