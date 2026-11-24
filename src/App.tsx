import { useEffect } from 'react'
import { startMotion } from './motion'
import { Footer, Header } from './components/Layout'
import { PatternField } from './components/PatternField'
import { PREVIEW_MODE, useRoute } from './router'
import { Home } from './pages/Home'
import { Coaches } from './pages/Coaches'
import { Philosophy } from './pages/Philosophy'
import { Resources, ArticlePage } from './pages/Resources'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'
import { Book } from './pages/Book'
import { Login } from './pages/Login'
import { Account } from './pages/Account'
import { Discipline } from './pages/Discipline'
import { articles, disciplines } from './content'

const titles: Record<string, string> = {
  home: 'Last Mile Endurance · Private endurance coaching',
  coaches: 'Coaches · Last Mile Endurance',
  philosophy: 'Philosophy · Last Mile Endurance',
  resources: 'Resources · Last Mile Endurance',
  contact: 'Work with us · Last Mile Endurance',
  book: 'Free consultation · Last Mile Endurance',
  login: 'Client login · Last Mile Endurance',
  account: 'My training · Last Mile Endurance',
  'not-found': 'Page not found · Last Mile Endurance',
}

export default function App() {
  const route = useRoute()

  useEffect(() => startMotion(), [])

  useEffect(() => {
    if (route.page === 'discipline') {
      document.title = `${disciplines[route.slug].name} coaching · Last Mile Endurance`
    } else if (route.page === 'article') {
      const article = articles.find((a) => a.slug === route.slug)
      document.title = `${article?.title ?? 'Field notes'} · Last Mile Endurance`
    } else {
      document.title = titles[route.page]
    }
  }, [route])

  return (
    <div className={`site-shell ${route.page === 'home' ? 'is-home' : ''} ${route.page === 'discipline' ? 'is-discipline' : ''}`}>
      <PatternField />
      {!PREVIEW_MODE && <a className="skip-link" href="#main">Skip to content</a>}
      {PREVIEW_MODE && (
        <p className="preview-bar">Preview · forms show their thank-you message but don’t send anything</p>
      )}
      <Header route={route} />
      <div id="main">
        {route.page === 'home' && <Home />}
        {route.page === 'coaches' && <Coaches />}
        {route.page === 'philosophy' && <Philosophy />}
        {route.page === 'resources' && <Resources />}
        {route.page === 'article' && <ArticlePage slug={route.slug} />}
        {route.page === 'contact' && <Contact />}
        {route.page === 'book' && <Book />}
        {route.page === 'login' && <Login />}
        {route.page === 'account' && <Account />}
        {route.page === 'discipline' && <Discipline key={route.slug} slug={route.slug} />}
        {route.page === 'not-found' && <NotFound />}
      </div>
      <Footer />
    </div>
  )
}
