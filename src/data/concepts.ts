// Types only — the actual concept data lives in src/content/site.json (key
// "concepts-page") so the client can edit it directly. See useContent('concepts-page').
import site from '@/content/site.json'

type ConceptsPageContent = typeof site['concepts-page']

export type ConceptSpace = ConceptsPageContent['spaces'][number]
export type ConceptType = ConceptsPageContent['types'][number]
export type Concept = ConceptsPageContent['items'][number]
