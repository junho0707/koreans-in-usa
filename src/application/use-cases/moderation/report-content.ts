import { ModerationRepository } from '@/src/application/ports/moderation-repository';
import { ReportTargetType } from '@/src/domain/entities/report';

export async function reportContent(
  repo: ModerationRepository,
  reporterId: number,
  targetType: ReportTargetType,
  targetId: number,
  reason: string,
): Promise<{ reportCount: number }> {
  if (!reason.trim()) {
    throw new Error('Reason is required');
  }

  if (targetType !== 'POST' && targetType !== 'COMMENT') {
    throw new Error('Invalid target type');
  }

  await repo.createReport({ reporterId, targetType, targetId, reason });
  const count = await repo.incrementReportCount(targetType, targetId);
  return { reportCount: count };
}
