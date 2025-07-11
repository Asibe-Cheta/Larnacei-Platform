import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/api/',
        '/_next/',
        '/private/',
        '*.json',
      ],
    },
    sitemap: 'https://larnacei.com/sitemap.xml',
    host: 'https://larnacei.com',
  }
} 