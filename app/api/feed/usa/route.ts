import { getUsaFeed } from '@/src/application/use-cases/feed/get-usa-feed';
import { PgFeedRepository } from '@/src/infrastructure/repositories/pg-feed-repository';
import { parseFeedQuery } from '@/src/interfaces/http/parsers/feed-query-parser';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgFeedRepository();

export async function GET(request: NextRequest) {
  try {
    const filters = parseFeedQuery(request.nextUrl.searchParams);
    const data = await getUsaFeed(repo, filters);
    return NextResponse.json(data);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request');
  }
}
