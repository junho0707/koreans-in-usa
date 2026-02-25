import { getRegionFeed } from '@/src/application/use-cases/feed/get-region-feed';
import { PgFeedRepository } from '@/src/infrastructure/repositories/pg-feed-repository';
import { parseFeedQuery } from '@/src/interfaces/http/parsers/feed-query-parser';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgFeedRepository();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const filters = parseFeedQuery(request.nextUrl.searchParams);
    const data = await getRegionFeed(repo, slug, filters);
    return NextResponse.json(data);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request');
  }
}
