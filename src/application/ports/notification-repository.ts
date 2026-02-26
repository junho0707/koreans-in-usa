export type NotificationType =
  | 'COMMENT_ON_POST'
  | 'REPLY_TO_COMMENT'
  | 'ACCEPTED_ANSWER'
  | 'NEW_FOLLOWER'
  | 'DM_RECEIVED';

export type Notification = {
  id: number;
  userId: number;
  type: NotificationType;
  actorId: number | null;
  actorDisplayName: string | null;
  postId: number | null;
  postTitle: string | null;
  commentId: number | null;
  messageId: number | null;
  isRead: boolean;
  createdAt: string;
};

export type CreateNotificationInput = {
  userId: number;
  type: NotificationType;
  actorId?: number;
  postId?: number;
  commentId?: number;
  messageId?: number;
};

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<void>;
  getByUser(userId: number, cursor?: number, limit?: number): Promise<{ items: Notification[]; nextCursor: number | null }>;
  getUnreadCount(userId: number): Promise<number>;
  markAsRead(userId: number, notificationId: number): Promise<void>;
  markAllAsRead(userId: number): Promise<void>;
}
