import { describe, expect, it } from 'vitest';
import { autoTag } from '@/src/domain/services/auto-tagger';
import { TopicTag } from '@/src/domain/entities/topic-tag';

const tags: TopicTag[] = [
  { id: 1, slug: 'visa', name: 'Visa', keywords: ['visa', 'h1b', 'green card'], createdAt: '' },
  { id: 2, slug: 'housing', name: 'Housing', keywords: ['housing', 'rent', 'apartment'], createdAt: '' },
  { id: 3, slug: 'jobs', name: 'Jobs', keywords: ['job', 'career', 'interview'], createdAt: '' },
  { id: 4, slug: 'food', name: 'Food', keywords: ['food', 'restaurant', 'kimchi'], createdAt: '' },
];

describe('autoTag', () => {
  it('returns matching tag ids sorted by keyword count', () => {
    const result = autoTag(
      'H1B visa interview tips',
      'I have a visa interview for my H1B. Any tips for the job interview?',
      tags,
    );
    // visa appears 3 times (h1b x2, visa x1), jobs appears 2 times (interview x2)
    expect(result[0]).toBe(1); // visa
    expect(result[1]).toBe(3); // jobs
    expect(result.length).toBe(2);
  });

  it('returns empty for no matches', () => {
    const result = autoTag('Hello world', 'Nothing related here', tags);
    expect(result.length).toBe(0);
  });

  it('limits to maxTags', () => {
    const result = autoTag(
      'visa housing job food',
      'visa rent job food interview apartment green card kimchi restaurant career',
      tags,
      2,
    );
    expect(result.length).toBe(2);
  });

  it('is case insensitive', () => {
    const result = autoTag('VISA H1B GREEN CARD', 'My VISA application', tags);
    expect(result).toContain(1);
  });
});
