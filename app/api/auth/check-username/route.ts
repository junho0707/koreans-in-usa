import { checkUsername } from '@/src/application/use-cases/user/check-username';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgUserRepository();

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
  }

  const result = await checkUsername(repo, username);
  return NextResponse.json(result);
}
