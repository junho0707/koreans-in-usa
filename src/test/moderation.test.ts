import { describe, expect, it } from 'vitest';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { reportContent } from '@/src/application/use-cases/moderation/report-content';
import { ModerationRepository } from '@/src/application/ports/moderation-repository';
import { Report, ReportTargetType } from '@/src/domain/entities/report';

function createMockModerationRepo(): ModerationRepository & { reportCounts: Map<string, number>; hidden: Set<string> } {
  const reportCounts = new Map<string, number>();
  const hidden = new Set<string>();

  return {
    reportCounts,
    hidden,
    async createReport(input) {
      return {
        id: 1,
        reporterId: input.reporterId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        createdAt: new Date().toISOString(),
      } as Report;
    },
    async incrementReportCount(targetType: ReportTargetType, targetId: number) {
      const key = `${targetType}:${targetId}`;
      const count = (reportCounts.get(key) ?? 0) + 1;
      reportCounts.set(key, count);
      if (count >= 10) {
        hidden.add(key);
      }
      return count;
    },
    async hideContent(targetType: ReportTargetType, targetId: number) {
      hidden.add(`${targetType}:${targetId}`);
    },
    async unhideContent(targetType: ReportTargetType, targetId: number) {
      hidden.delete(`${targetType}:${targetId}`);
    },
    async getReportedContent() { return []; },
    async getReportCount(targetType: ReportTargetType, targetId: number) {
      return reportCounts.get(`${targetType}:${targetId}`) ?? 0;
    },
  };
}

describe('reportContent', () => {
  it('creates a report and increments count', async () => {
    const repo = createMockModerationRepo();
    const result = await reportContent(repo, 1, 'POST', 42, 'spam');
    expect(result.reportCount).toBe(1);
    expect(repo.reportCounts.get('POST:42')).toBe(1);
  });

  it('rejects empty reason', async () => {
    const repo = createMockModerationRepo();
    try {
      await reportContent(repo, 1, 'POST', 42, '  ');
      expect(false).toBe(true);
    } catch (e) {
      expect((e as Error).message).toBe('Reason is required');
    }
  });

  it('auto-hides at 10 reports', async () => {
    const repo = createMockModerationRepo();
    for (let i = 0; i < 10; i++) {
      await reportContent(repo, i + 1, 'POST', 42, 'spam');
    }
    expect(repo.hidden.has('POST:42')).toBe(true);
  });
});

describe('rate limiter', () => {
  it('allows requests under the limit', () => {
    // Use a unique user ID to avoid interference
    expect(checkRateLimit(99999, 'posts')).toBe(true);
    expect(checkRateLimit(99999, 'posts')).toBe(true);
  });

  it('blocks after exceeding limit', () => {
    const userId = 88888;
    for (let i = 0; i < 10; i++) {
      checkRateLimit(userId, 'posts');
    }
    // 11th should be blocked
    expect(checkRateLimit(userId, 'posts')).toBe(false);
  });
});
