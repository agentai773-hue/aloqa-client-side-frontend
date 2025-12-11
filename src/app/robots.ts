import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/', // Private dashboard areas
          '/api/',       // API endpoints
          '/_next/',     // Next.js internal files
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}