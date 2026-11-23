import { useEffect } from 'react'
import { Footer, Header } from './components/Layout'
import { useRoute } from './router'
import { Home } from './pages/Home'
import { Coaches } from './pages/Coaches'
import { Philosophy } from './pages/Philosophy'
import { Resources, ArticlePage } from './pages/Resources'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'
import { Book } from './pages/Book'
import { Plans } from './pages/Plans'
import { Login } from './pages/Login'
import { Account } from './pages/Account'
import { articles } from './content'

const titles: Record<string, string> = {
  home: 'Last Mile Endurance · Private endurance coaching',
  coaches: 'Coaches · Last Mile Endurance',
  philosophy: 'Philosophy · Last Mile Endurance',
  resources: 'Resources · Last Mile Endurance',
  contact: 'Work with us · Last Mile Endurance',
  book: 'Book a call · Last Mile Endurance',
  plans: 'Coaching plans · Last Mile Endurance',
  login: 'Client login · Last Mile Endurance',
  account: 'My training · Last Mile Endurance',
  'not-found': 'Page not found · Last Mile Endurance',
}

export default function App() {
  const route = useRoute()

  useEffect(() => {
    if (route.page === 'article') {
      const article = articles.find((a) => a.slug === route.slug)
      document.title = `${article?.title ?? 'Field notes'} · Last Mile Endurance`
    } else {
      document.title = titles[route.page]
    }
  }, [route])

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header route={route} />
      <div id="main">
        {route.page === 'home' && <Home />}
        {route.page === 'coaches' && <Coaches />}
        {route.page === 'philosophy' && <Philosophy />}
        {route.page === 'resources' && <Resources />}
        {route.page === 'article' && <ArticlePage slug={route.slug} />}
        {route.page === 'contact' && <Contact />}
        {route.page === 'book' && <Book />}
        {route.page === 'plans' && <Plans />}
        {route.page === 'login' && <Login />}
        {route.page === 'account' && <Account />}
        {route.page === 'not-found' && <NotFound />}
      </div>
      <Footer />
    </div>
  )
}
