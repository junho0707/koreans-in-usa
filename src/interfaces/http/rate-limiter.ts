type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  posts: { max: 10, windowMs: 60 * 60 * 1000 },     // 10 posts/hr
  comments: { max: 30, windowMs: 60 * 60 * 1000 },   // 30 comments/hr
  votes: { max: 60, windowMs: 60 * 60 * 1000 },       // 60 votes/hr
  reports: { max: 10, windowMs: 60 * 60 * 1000 },     // 10 reports/hr
};

export function checkRateLimit(userId: number, action: string): boolean {
  const config = LIMITS[action];
  if (!config) return true;

  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.max) {
    return false;
  }

  entry.count++;
  return true;
}
