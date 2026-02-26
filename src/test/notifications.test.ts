import { describe, it, expect } from 'vitest';
import type {
  NotificationRepository,
  Notification,
  CreateNotificationInput,
} from '@/src/application/ports/notification-repository';

class MockNotificationRepository implements NotificationRepository {
  private notifications: (Notification & { _raw: CreateNotificationInput })[] = [];
  private nextId = 1;

  async create(input: CreateNotificationInput): Promise<void> {
    if (input.actorId && input.actorId === input.userId) return;
    this.notifications.push({
      id: this.nextId++,
      userId: input.userId,
      type: input.type,
      actorId: input.actorId ?? null,
      actorDisplayName: null,
      postId: input.postId ?? null,
      postTitle: null,
      commentId: input.commentId ?? null,
      messageId: input.messageId ?? null,
      isRead: false,
      createdAt: new Date().toISOString(),
      _raw: input,
    });
  }

  async getByUser(userId: number) {
    const items = this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.id - a.id);
    return { items, nextCursor: null };
  }

  async getUnreadCount(userId: number) {
    return this.notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }

  async markAsRead(userId: number, notificationId: number) {
    const n = this.notifications.find((n) => n.id === notificationId && n.userId === userId);
    if (n) n.isRead = true;
  }

  async markAllAsRead(userId: number) {
    this.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true));
  }
}

describe('Notifications', () => {
  it('creates notification and retrieves it', async () => {
    const repo = new MockNotificationRepository();
    await repo.create({ userId: 1, type: 'COMMENT_ON_POST', actorId: 2, postId: 10 });
    const { items } = await repo.getByUser(1);
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('COMMENT_ON_POST');
  });

  it('does not notify self', async () => {
    const repo = new MockNotificationRepository();
    await repo.create({ userId: 1, type: 'COMMENT_ON_POST', actorId: 1, postId: 10 });
    expect(await repo.getUnreadCount(1)).toBe(0);
  });

  it('marks as read', async () => {
    const repo = new MockNotificationRepository();
    await repo.create({ userId: 1, type: 'NEW_FOLLOWER', actorId: 2 });
    expect(await repo.getUnreadCount(1)).toBe(1);
    const { items } = await repo.getByUser(1);
    await repo.markAsRead(1, items[0].id);
    expect(await repo.getUnreadCount(1)).toBe(0);
  });

  it('marks all as read', async () => {
    const repo = new MockNotificationRepository();
    await repo.create({ userId: 1, type: 'NEW_FOLLOWER', actorId: 2 });
    await repo.create({ userId: 1, type: 'DM_RECEIVED', actorId: 3 });
    expect(await repo.getUnreadCount(1)).toBe(2);
    await repo.markAllAsRead(1);
    expect(await repo.getUnreadCount(1)).toBe(0);
  });
});
