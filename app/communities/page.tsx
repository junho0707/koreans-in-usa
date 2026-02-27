import { Metadata } from 'next';
import CommunitiesBrowser from '@/src/components/communities/communities-browser';

export const metadata: Metadata = {
  title: 'Communities | Koreans in USA',
  description: 'Discover and join communities for Koreans in the USA',
};

export default function CommunitiesPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Communities</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Find your people. Join communities based on interests, location, or topics.</p>
      <CommunitiesBrowser />
    </main>
  );
}
