import { resolveLoginIdentifier } from '@/src/application/use-cases/user/resolve-login-identifier';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgUserRepository();

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    const email = await resolveLoginIdentifier(repo, identifier);

    if (!email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ email });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
