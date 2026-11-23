import { useEffect, useState } from 'react'

export type Route =
  | { page: 'home' }
  | { page: 'coaches' }
  | { page: 'philosophy' }
  | { page: 'resources' }
  | { page: 'article'; slug: string }
  | { page: 'contact' }
  | { page: 'book' }
  | { page: 'login' }
  | { page: 'account' }
  | { page: 'not-found' }

export function parsePath(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return { page: 'home' }
  const [first, second] = parts
  if (first === 'resources' && second) return { page: 'article', slug: second }
  const simple = ['coaches', 'philosophy', 'resources', 'contact', 'book', 'login', 'account'] as const
  if (parts.length === 1 && (simple as readonly string[]).includes(first)) {
    return { page: first as (typeof simple)[number] }
  }
  return { page: 'not-found' }
}

/*
 * PREVIEW_MODE is for the shareable preview build (npm run build:preview).
 * That build lives inside a frame that only allows plain #names in the
 * address, so pages use #coaches, #note-easy-days and so on instead of
 * /coaches and /resources/easy-days, and forms don't really send.
 */
export const PREVIEW_MODE = import.meta.env.VITE_PREVIEW_MODE === '1'

let previewSearch = ''

function toHash(path: string) {
  if (path === '/') return ''
  const [first, second] = path.split('/').filter(Boolean)
  return first === 'resources' && second ? `note-${second}` : first
}

function fromHash(hash: string) {
  if (!hash) return '/'
  return hash.startsWith('note-') ? `/resources/${hash.slice(5)}` : `/${hash}`
}

function currentPath() {
  return PREVIEW_MODE ? fromHash(window.location.hash.slice(1)) : window.location.pathname
}

/** The query string of the current page, e.g. "?coach=Emily%20Brown". */
export function currentSearch() {
  return PREVIEW_MODE ? previewSearch : window.location.search
}

/** The href to put on a link to an internal page. */
export function hrefFor(path: string) {
  return PREVIEW_MODE ? `#${toHash(path.split('?')[0])}` || '#' : path
}

export function navigate(target: string) {
  const [path, query = ''] = target.split('?')
  if (PREVIEW_MODE) {
    previewSearch = query ? `?${query}` : ''
    const hash = toHash(path)
    if (window.location.hash.slice(1) === hash) window.dispatchEvent(new HashChangeEvent('hashchange'))
    else window.location.hash = hash
  } else {
    if (target === window.location.pathname + window.location.search) return
    window.history.pushState({}, '', target)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parsePath(currentPath()))
  useEffect(() => {
    const onChange = () => setRoute(parsePath(currentPath()))
    const event = PREVIEW_MODE ? 'hashchange' : 'popstate'
    window.addEventListener(event, onChange)
    // A child may have navigated during the first render, before this listener existed.
    onChange()
    return () => window.removeEventListener(event, onChange)
  }, [])
  return route
}
