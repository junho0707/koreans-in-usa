import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Topics - Koreans in USA',
  description: 'Browse posts by topic in the Koreans in USA community',
};

export default function TagsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
