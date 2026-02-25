import { fetchAndStoreNews } from '@/src/application/use-cases/news/fetch-news';
import { PgNewsRepository } from '@/src/infrastructure/repositories/pg-news-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { requireAdmin } from '@/src/interfaces/http/require-admin';
import { unauthorized, forbidden } from '@/src/interfaces/http/response';
import { NextResponse } from 'next/server';

const repo = new PgNewsRepository();

export async function POST() {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);

    const result = await fetchAndStoreNews(repo);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error';
    if (message === 'Not authenticated') return unauthorized(message);
    if (message === 'Admin access required') return forbidden(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
