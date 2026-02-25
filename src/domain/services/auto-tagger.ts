import { TopicTag } from '@/src/domain/entities/topic-tag';

export function autoTag(
  title: string,
  body: string,
  tags: TopicTag[],
  maxTags = 5,
): number[] {
  const text = `${title} ${body}`.toLowerCase();
  const scored: { tagId: number; count: number }[] = [];

  for (const tag of tags) {
    let count = 0;
    for (const keyword of tag.keywords) {
      const kw = keyword.toLowerCase();
      let idx = 0;
      while ((idx = text.indexOf(kw, idx)) !== -1) {
        count++;
        idx += kw.length;
      }
    }
    if (count > 0) {
      scored.push({ tagId: tag.id, count });
    }
  }

  scored.sort((a, b) => b.count - a.count);
  return scored.slice(0, maxTags).map((s) => s.tagId);
}
