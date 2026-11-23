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

export function navigate(path: string) {
  if (path === window.location.pathname) return
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parsePath(window.location.pathname))
  useEffect(() => {
    const onPop = () => setRoute(parsePath(window.location.pathname))
    window.addEventListener('popstate', onPop)
    // A child may have navigated during the first render, before this listener existed.
    onPop()
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return route
}
