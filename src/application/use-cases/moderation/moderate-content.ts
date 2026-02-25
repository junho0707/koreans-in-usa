import { ModerationRepository } from '@/src/application/ports/moderation-repository';
import { ReportTargetType } from '@/src/domain/entities/report';

export async function hideContent(
  repo: ModerationRepository,
  targetType: ReportTargetType,
  targetId: number,
): Promise<void> {
  await repo.hideContent(targetType, targetId);
}

export async function unhideContent(
  repo: ModerationRepository,
  targetType: ReportTargetType,
  targetId: number,
): Promise<void> {
  await repo.unhideContent(targetType, targetId);
}
