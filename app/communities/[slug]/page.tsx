import { Metadata } from 'next';
import CommunityDetail from '@/src/components/communities/community-detail';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formattedName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${formattedName} | Communities | Koreans in USA`,
    description: `View the ${formattedName} community on Koreans in USA`,
  };
}

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <CommunityDetail slug={slug} />
    </main>
  );
}
