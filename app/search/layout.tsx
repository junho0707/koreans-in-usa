import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - Koreans in USA',
  description: 'Search posts and discussions in the Koreans in USA community',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
