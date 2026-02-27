import { Metadata } from 'next';
import CreateCommunityForm from '@/src/components/communities/create-community-form';

export const metadata: Metadata = {
  title: 'Create Community | Koreans in USA',
  description: 'Start a new community for Koreans in the USA',
};

export default function CreateCommunityPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Create a Community</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Build a space for people who share your interests or live in your area.
      </p>
      <CreateCommunityForm />
    </main>
  );
}
