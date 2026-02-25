import { fetchAndStoreNews } from '@/src/application/use-cases/news/fetch-news';
import { PgNewsRepository } from '@/src/infrastructure/repositories/pg-news-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgNewsRepository();

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchAndStoreNews(repo);
  return NextResponse.json(result);
}
