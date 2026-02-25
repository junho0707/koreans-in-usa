import { describe, expect, it } from 'vitest';
import { tagNewsItem } from '@/src/infrastructure/news/news-tagger';

describe('news tagger', () => {
  it('tags news item with matching keywords', () => {
    const tags = tagNewsItem(
      'New visa policy for Korean immigrants',
      'The USCIS announced new immigration rules affecting H1B holders.',
    );
    expect(tags).toContain('visa');
    expect(tags).toContain('korea');
  });

  it('includes source tags', () => {
    const tags = tagNewsItem('General news', 'Nothing special', ['korea']);
    expect(tags).toContain('korea');
  });

  it('returns empty for unrelated content', () => {
    const tags = tagNewsItem('Weather today', 'Sunny skies expected');
    expect(tags.length).toBe(0);
  });

  it('tags multiple categories', () => {
    const tags = tagNewsItem(
      'Korean students face housing crisis',
      'University students struggle to find apartments near campus',
    );
    expect(tags).toContain('housing');
    expect(tags).toContain('school');
    expect(tags).toContain('korea');
  });
});
