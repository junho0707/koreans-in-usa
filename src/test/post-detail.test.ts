import { describe, expect, it } from 'vitest';
import { buildCommentTree } from '@/src/application/use-cases/post/get-comments-threaded';
import { Comment } from '@/src/domain/entities/comment';

function makeComment(overrides: Partial<Comment> & { id: number }): Comment {
  return {
    postId: 1,
    authorId: 1,
    authorDisplayName: 'user',
    parentCommentId: null,
    body: 'comment',
    score: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildCommentTree', () => {
  it('builds a flat list into nested tree', () => {
    const comments: Comment[] = [
      makeComment({ id: 1, body: 'root1', score: 5 }),
      makeComment({ id: 2, body: 'root2', score: 10 }),
      makeComment({ id: 3, body: 'reply to 1', parentCommentId: 1, score: 3 }),
      makeComment({ id: 4, body: 'reply to 3', parentCommentId: 3, score: 1 }),
    ];

    const tree = buildCommentTree(comments, 'best');

    expect(tree.length).toBe(2);
    // Sorted by score: root2 (10) before root1 (5)
    expect(tree[0].id).toBe(2);
    expect(tree[1].id).toBe(1);
    // root1 has a reply
    expect(tree[1].replies.length).toBe(1);
    expect(tree[1].replies[0].id).toBe(3);
    // reply to 1 has a nested reply
    expect(tree[1].replies[0].replies.length).toBe(1);
    expect(tree[1].replies[0].replies[0].id).toBe(4);
  });

  it('sorts by new (reverse chronological)', () => {
    const comments: Comment[] = [
      makeComment({ id: 1, createdAt: '2026-01-01T10:00:00.000Z', score: 1 }),
      makeComment({ id: 2, createdAt: '2026-01-01T12:00:00.000Z', score: 5 }),
      makeComment({ id: 3, createdAt: '2026-01-01T11:00:00.000Z', score: 10 }),
    ];

    const tree = buildCommentTree(comments, 'new');
    expect(tree[0].id).toBe(2);
    expect(tree[1].id).toBe(3);
    expect(tree[2].id).toBe(1);
  });

  it('handles orphan replies gracefully', () => {
    const comments: Comment[] = [
      makeComment({ id: 1, body: 'root' }),
      makeComment({ id: 2, body: 'orphan', parentCommentId: 999 }),
    ];

    const tree = buildCommentTree(comments, 'best');
    // Orphan becomes a root-level node
    expect(tree.length).toBe(2);
  });
});
