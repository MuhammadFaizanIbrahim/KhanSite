import { useEffect, useState } from 'react'
import siteDefault from '@/content/site.json'

// When set (e.g. an R2 public bucket URL pointing at site.json), the whole
// content file is fetched from there at runtime — so the client can update
// every section's text by replacing that one file in R2, with no
// rebuild/redeploy. Unset (default): the bundled src/content/site.json is used.
const CONTENT_URL = import.meta.env.VITE_CONTENT_URL as string | undefined

type SiteContent = typeof siteDefault

// Fetched once and shared by every section — not once per section.
let sitePromise: Promise<SiteContent> | null = null

function loadSite(): Promise<SiteContent> {
  if (!CONTENT_URL) return Promise.resolve(siteDefault)
  if (!sitePromise) {
    sitePromise = fetch(CONTENT_URL, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .catch(() => siteDefault) // any failure — bad upload, offline, etc. — keeps the bundled copy
  }
  return sitePromise
}

// Reads one section's slice of site.json by key, e.g. useContent('hero').
// Starts with the bundled default and swaps in the live copy once it resolves.
export function useContent<K extends keyof SiteContent>(key: K): SiteContent[K] {
  const [data, setData] = useState<SiteContent[K]>(siteDefault[key])

  useEffect(() => {
    let cancelled = false
    loadSite().then(site => { if (!cancelled) setData(site[key]) })
    return () => { cancelled = true }
  }, [key])

  return data
}
