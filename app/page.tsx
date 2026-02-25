import { FeedList } from '@/src/components/feed-list';

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <h1>USA Feed</h1>
      <FeedList endpoint="/api/feed/usa?sort=top12h&limit=30" />
    </main>
  );
}
