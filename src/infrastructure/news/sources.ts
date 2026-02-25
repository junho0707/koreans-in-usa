export type RssSource = {
  name: string;
  url: string;
  tags?: string[];
};

export const RSS_SOURCES: RssSource[] = [
  {
    name: 'Korea Herald',
    url: 'https://www.koreaherald.com/rss/020200030000.xml',
    tags: ['korea'],
  },
  {
    name: 'Korea Times',
    url: 'https://www.koreatimes.co.kr/www/rss/nation.xml',
    tags: ['korea'],
  },
];
