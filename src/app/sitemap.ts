import { MetadataRoute } from 'next'
import { getAdminDb } from '@/lib/firebase-admin-server'

const baseUrl = 'https://myfestivo.live'

// Static pages that are publicly indexable
const staticPages: MetadataRoute.Sitemap = [
  {
    url: baseUrl,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    url: `${baseUrl}/events`,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${baseUrl}/signup`,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/login`,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${baseUrl}/forgot-password`,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    url: `${baseUrl}/privacy-policy`,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: `${baseUrl}/terms`,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: `${baseUrl}/sitemap-page`,
    lastModified: new Date('2026-07-01'),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dynamicEventPages: MetadataRoute.Sitemap = []

  try {
    const db = await getAdminDb()
    const snapshot = await db.collection('events').get()

    dynamicEventPages = snapshot.docs
      .filter(doc => {
        const data = doc.data()
        // Only include published events (not pending_review or deleted)
        return !data.status || data.status === 'published'
      })
      .map(doc => ({
        url: `${baseUrl}/events/${doc.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
  } catch (err) {
    // Graceful degradation: if Admin SDK isn't configured (e.g. local dev without .env),
    // return only static pages so the sitemap still builds successfully.
    console.warn('[sitemap] Could not fetch dynamic event pages:', err)
  }

  return [...staticPages, ...dynamicEventPages]
}
