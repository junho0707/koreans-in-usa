import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koreansinusa.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1 },
    { url: `${BASE_URL}/groups/northeast`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.8 },
    { url: `${BASE_URL}/groups/south`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.8 },
    { url: `${BASE_URL}/groups/midwest`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.8 },
    { url: `${BASE_URL}/groups/west`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  return staticPages;
}
