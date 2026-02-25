import { FeedList } from '@/src/components/feed-list';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ state?: string }>;
};

async function getProfileStateDefault(): Promise<string | null> {
  return null;
}

export default async function RegionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;

  const defaultState = query.state ?? (await getProfileStateDefault()) ?? undefined;
  const endpoint = defaultState
    ? `/api/feed/region/${slug}?sort=top12h&state=${defaultState}&limit=30`
    : `/api/feed/region/${slug}?sort=top12h&limit=30`;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <h1>Region Feed: {slug}</h1>
      <FeedList endpoint={endpoint} />
    </main>
  );
}
