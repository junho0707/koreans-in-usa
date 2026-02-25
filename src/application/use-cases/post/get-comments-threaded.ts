import { Comment, CommentNode } from '@/src/domain/entities/comment';

export function buildCommentTree(
  flat: Comment[],
  sort: 'best' | 'new' = 'best',
): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of flat) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of flat) {
    const node = map.get(comment.id)!;
    if (comment.parentCommentId) {
      const parent = map.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  const comparator =
    sort === 'best'
      ? (a: CommentNode, b: CommentNode) => b.score - a.score || a.createdAt.localeCompare(b.createdAt)
      : (a: CommentNode, b: CommentNode) => b.createdAt.localeCompare(a.createdAt);

  function sortTree(nodes: CommentNode[]) {
    nodes.sort(comparator);
    for (const node of nodes) {
      sortTree(node.replies);
    }
  }

  sortTree(roots);
  return roots;
}
