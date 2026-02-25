import { describe, expect, it } from 'vitest';
import { buildCommentTree } from '@/src/application/use-cases/post/get-comments-threaded';
import { Comment } from '@/src/domain/entities/comment';

function c(id: number, parentId: number | null, score: number, time: string): Comment {
  return {
    id,
    postId: 1,
    authorId: 1,
    authorDisplayName: `user${id}`,
    parentCommentId: parentId,
    body: `comment ${id}`,
    score,
    createdAt: time,
  };
}

describe('comment threading', () => {
  it('deeply nested comments are placed correctly', () => {
    const comments = [
      c(1, null, 5, '2026-01-01T01:00:00Z'),
      c(2, 1, 3, '2026-01-01T02:00:00Z'),
      c(3, 2, 1, '2026-01-01T03:00:00Z'),
      c(4, 3, 0, '2026-01-01T04:00:00Z'),
    ];

    const tree = buildCommentTree(comments, 'best');
    expect(tree.length).toBe(1);
    expect(tree[0].replies[0].replies[0].replies[0].id).toBe(4);
  });

  it('sorts siblings by score in best mode', () => {
    const comments = [
      c(1, null, 1, '2026-01-01T01:00:00Z'),
      c(2, null, 10, '2026-01-01T02:00:00Z'),
      c(3, null, 5, '2026-01-01T03:00:00Z'),
    ];

    const tree = buildCommentTree(comments, 'best');
    expect(tree.map((n) => n.id)).toEqual([2, 3, 1]);
  });

  it('empty comments returns empty tree', () => {
    const tree = buildCommentTree([], 'best');
    expect(tree.length).toBe(0);
  });
});
