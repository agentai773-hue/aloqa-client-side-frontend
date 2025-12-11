import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aloqa AI - Client Calling Portal',
    short_name: 'Aloqa AI',
    description: 'AI-powered client calling portal for real estate professionals',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5DD149',
    icons: [
      {
        src: '/inner-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity', 'utilities'],
    screenshots: [],
    orientation: 'portrait',
  };
}