import { Link } from '../components/Link'

export function NotFound() {
  return (
    <main className="inner-page">
      <section className="page-hero">
        <p className="eyebrow">Off course</p>
        <h1>This page took <em>a wrong turn.</em></h1>
        <p>
          <Link className="button button-light" href="/">Back to the start <span>→</span></Link>
        </p>
      </section>
    </main>
  )
}
