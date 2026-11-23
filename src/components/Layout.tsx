import { useState } from 'react'
import type { Route } from '../router'
import { Link } from './Link'
import { useUser } from '../auth'

const navItems = [
  { label: 'Home', href: '/', page: 'home' },
  { label: 'Coaches', href: '/coaches', page: 'coaches' },
  { label: 'Philosophy', href: '/philosophy', page: 'philosophy' },
  { label: 'Resources', href: '/resources', page: 'resources' },
  { label: 'Plans', href: '/plans', page: 'plans' },
] as const

export function Wordmark() {
  return (
    <div className="wordmark">
      <span className="wordmark-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        LAST MILE
        <small>ENDURANCE</small>
      </span>
    </div>
  )
}

export function Header({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const current = route.page === 'article' ? 'resources' : route.page
  const user = useUser()
  const close = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <Link className="logo-button" href="/" aria-label="Last Mile home" onClick={close}>
        <Wordmark />
      </Link>
      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
      >
        <span />
        <span />
      </button>
      <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.page}
            href={item.href}
            className={`nav-link ${current === item.page ? 'active' : ''}`}
            aria-current={current === item.page ? 'page' : undefined}
            onClick={close}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href={user ? '/account' : '/login'}
          className={`nav-link ${current === 'login' || current === 'account' ? 'active' : ''}`}
          onClick={close}
        >
          {user ? 'My training' : 'Client login'}
        </Link>
        <Link className="nav-cta" href="/book" onClick={close}>
          Book a call <span>↗</span>
        </Link>
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <Wordmark />
        <div>
          <p className="eyebrow">Ready when you are</p>
          <h2>Your next finish line starts here.</h2>
        </div>
        <Link className="circle-link" href="/book">
          Let’s talk <span>↗</span>
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Last Mile Endurance</span>
        <div>
          {navItems.slice(1).map((item) => (
            <Link key={item.page} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/book">Book a call</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Client login</Link>
        </div>
        <span>Run with purpose.</span>
      </div>
    </footer>
  )
}
