import { PgSearchRepository } from '@/src/infrastructure/repositories/pg-search-repository';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgSearchRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return badRequest('Search query must be at least 2 characters');
    }

    const result = await repo.search({
      query,
      type: (searchParams.get('type') as 'QA' | 'TIP' | 'GENERAL') || undefined,
      region: searchParams.get('region') || undefined,
      tag: searchParams.get('tag') || undefined,
      cursor: searchParams.get('cursor') ? Number(searchParams.get('cursor')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });

    return NextResponse.json(result);
  } catch {
    return badRequest('Search failed');
  }
}
