import { Report, ReportTargetType } from '@/src/domain/entities/report';

export type CreateReportInput = {
  reporterId: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
};

export type ReportedItem = {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  reportCount: number;
  isHidden: boolean;
  content: string;
  authorDisplayName: string;
};

export interface ModerationRepository {
  createReport(input: CreateReportInput): Promise<Report>;
  hideContent(targetType: ReportTargetType, targetId: number): Promise<void>;
  unhideContent(targetType: ReportTargetType, targetId: number): Promise<void>;
  getReportedContent(limit: number, offset: number): Promise<ReportedItem[]>;
  getReportCount(targetType: ReportTargetType, targetId: number): Promise<number>;
  incrementReportCount(targetType: ReportTargetType, targetId: number): Promise<number>;
}
