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
    const description = post.body.slice(0, 160).replace(/\n/g, ' ');

    const ogImages = post.imageUrl ? [{ url: post.imageUrl }] : [];

    return {
      title: `${post.title} | Koreans in USA`,
      description,
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        images: ogImages,
        siteName: 'Koreans in USA',
      },
      twitter: {
        card: post.imageUrl ? 'summary_large_image' : 'summary',
        title: post.title,
        description,
        images: ogImages.map((img) => img.url),
      },
    };
  } catch {
    return { title: 'Koreans in USA' };
  }
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
