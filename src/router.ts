import { useEffect, useState } from 'react'

export type Route =
  | { page: 'home' }
  | { page: 'coaches' }
  | { page: 'philosophy' }
  | { page: 'resources' }
  | { page: 'article'; slug: string }
  | { page: 'contact' }
  | { page: 'not-found' }

export function parsePath(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return { page: 'home' }
  const [first, second] = parts
  if (first === 'resources' && second) return { page: 'article', slug: second }
  if (parts.length === 1 && ['coaches', 'philosophy', 'resources', 'contact'].includes(first)) {
    return { page: first as 'coaches' | 'philosophy' | 'resources' | 'contact' }
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
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return route
}
