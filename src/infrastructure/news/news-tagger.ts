type TagRule = {
  tag: string;
  keywords: string[];
};

const TAG_RULES: TagRule[] = [
  { tag: 'visa', keywords: ['visa', 'immigration', 'green card', 'h1b', 'uscis'] },
  { tag: 'housing', keywords: ['housing', 'rent', 'apartment', 'real estate', 'mortgage'] },
  { tag: 'jobs', keywords: ['job', 'employment', 'career', 'hiring', 'layoff'] },
  { tag: 'food', keywords: ['food', 'restaurant', 'cuisine', 'cooking', 'recipe'] },
  { tag: 'legal', keywords: ['legal', 'law', 'court', 'lawsuit', 'attorney'] },
  { tag: 'medical', keywords: ['medical', 'health', 'hospital', 'doctor', 'insurance'] },
  { tag: 'school', keywords: ['school', 'university', 'college', 'education', 'student'] },
  { tag: 'korea', keywords: ['korea', 'korean', 'seoul'] },
];

export function tagNewsItem(title: string, summary: string | null, sourceTags?: string[]): string[] {
  const text = `${title} ${summary ?? ''}`.toLowerCase();
  const matched = new Set<string>(sourceTags ?? []);

  for (const rule of TAG_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matched.add(rule.tag);
        break;
      }
    }
  }

  return Array.from(matched);
}
