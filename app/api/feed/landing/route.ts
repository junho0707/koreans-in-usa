import { getLandingSummary } from '@/src/application/use-cases/feed/get-landing-summary';
import { PgFeedRepository } from '@/src/infrastructure/repositories/pg-feed-repository';
import { NextResponse } from 'next/server';

const repo = new PgFeedRepository();

export async function GET() {
  try {
    const data = await getLandingSummary(repo);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load landing data' },
      { status: 500 },
    );
  }
}
