import type { ComponentProps, MouseEvent } from 'react'
import { hrefFor, navigate } from '../router'

/** An internal link that changes the page without a full reload. */
export function Link({ href, onClick, ...rest }: ComponentProps<'a'> & { href: string }) {
  const handle = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    navigate(href)
  }
  return <a href={hrefFor(href)} onClick={handle} {...rest} />
}
