import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/posts/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      return { title: 'Post Not Found | Koreans in USA' };
    }
    const data = await res.json();
    const post = data.post;

    return {
      title: `${post.title} | Koreans in USA`,
      description: post.body.slice(0, 160),
      openGraph: {
        title: post.title,
        description: post.body.slice(0, 160),
        type: 'article',
      },
    };
  } catch {
    return { title: 'Koreans in USA' };
  }
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
