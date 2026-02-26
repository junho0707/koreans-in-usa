import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trending - Koreans in USA',
  description: 'Most engaged posts from the Korean-American community this week.',
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
