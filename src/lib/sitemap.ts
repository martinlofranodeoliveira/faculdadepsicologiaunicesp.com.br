import { siteConfig } from '@/site/config'

import { getGraduationCoursePages, getPostCoursePages } from './courseCatalog'

export type SitemapEntry = {
  path: string
  changeFrequency?: 'daily' | 'weekly' | 'monthly'
  priority?: number
}

export function getSiteUrl(): URL {
  const configuredSiteUrl = process.env.SITE_URL?.trim() || siteConfig.siteUrl
  return new URL(configuredSiteUrl.endsWith('/') ? configuredSiteUrl : `${configuredSiteUrl}/`)
}

export function getStaticSitemapEntries(): SitemapEntry[] {
  return [
    {
      path: '/',
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      path: '/pos-graduacao',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      path: '/graduacao/psicologia',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      path: '/graduacao/vestibular',
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      path: '/politica-de-privacidade',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      path: '/termos-de-uso',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [graduationCourses, postCourses] = await Promise.all([
    getGraduationCoursePages(),
    getPostCoursePages(),
  ])

  const graduationEntries = graduationCourses.map(({ path }) => ({
    path,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  const postEntries = postCourses.map(({ path }) => ({
    path,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))
  const uniqueEntries = new Map<string, SitemapEntry>()

  ;[...getStaticSitemapEntries(), ...graduationEntries, ...postEntries].forEach((entry) => {
    if (!uniqueEntries.has(entry.path)) {
      uniqueEntries.set(entry.path, entry)
    }
  })

  return [...uniqueEntries.values()]
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const siteUrl = getSiteUrl()
  const xmlEntries = entries
    .map((entry) => {
      const absoluteUrl = new URL(entry.path, siteUrl).toString()
      const priorityTag =
        typeof entry.priority === 'number' ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''
      const changeFrequencyTag = entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : ''

      return `<url><loc>${escapeXml(absoluteUrl)}</loc>${changeFrequencyTag}${priorityTag}</url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlEntries}</urlset>`
}
