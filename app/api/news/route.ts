import { getNewsFeed } from '@/src/application/use-cases/news/get-news-feed';
import { PgNewsRepository } from '@/src/infrastructure/repositories/pg-news-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgNewsRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const cursor = searchParams.get('cursor') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;

  const page = await getNewsFeed(repo, { limit, cursor, tag });
  return NextResponse.json(page);
}
