import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/events',
          '/login',
          '/signup',
          '/sitemap-page',
        ],
        disallow: [
          '/dashboard',
          '/profile',
          '/friends',
          '/admin',
          '/api/',
          '/events/create',
        ],
      },
    ],
    sitemap: [
      'https://myfestivo.live/sitemap.xml',
    ],
  }
}
