import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard - Koreans in USA',
  description: 'Top contributors in the Korean-American community.',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
