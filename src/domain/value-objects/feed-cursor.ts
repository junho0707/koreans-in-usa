export type FeedCursor = {
  score: number;
  createdAt: string;
  id: number;
};

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeFeedCursor(raw: string): FeedCursor {
  const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as FeedCursor;
  if (
    typeof parsed.score !== 'number' ||
    typeof parsed.createdAt !== 'string' ||
    typeof parsed.id !== 'number'
  ) {
    throw new Error('Invalid cursor');
  }
  return parsed;
}

export function isAfterCursor(
  item: { score: number; createdAt: string; id: number },
  cursor: FeedCursor,
): boolean {
  return (
    item.score < cursor.score ||
    (item.score === cursor.score && item.createdAt < cursor.createdAt) ||
    (item.score === cursor.score && item.createdAt === cursor.createdAt && item.id < cursor.id)
  );
}
