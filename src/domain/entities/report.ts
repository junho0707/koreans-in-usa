export type ReportTargetType = 'POST' | 'COMMENT';

export type Report = {
  id: number;
  reporterId: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  createdAt: string;
};
