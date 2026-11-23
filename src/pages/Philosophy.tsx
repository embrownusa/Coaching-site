import { principles } from '../content'
import { QuarterShape, ButtonShape, ShapeField } from '../components/Shapes'

const steps = [
  ['Listen', 'We begin with your history, motivations, constraints, and the athlete you want to become.'],
  ['Build', 'We create a clear, purposeful plan where every session has a reason and every week has rhythm.'],
  ['Adapt', 'We review, talk, and adjust. The plan serves you—not the other way around.'],
]

export function Philosophy() {
  return (
    <main className="inner-page philosophy-page">
      <section className="page-hero">
        <ShapeField variant="page" />
        <p className="eyebrow">How we work</p>
        <h1>Built for progress. <em>Designed to last.</em></h1>
        <p>Science gives us direction. Conversation gives it meaning.</p>
      </section>
      <section className="process section-pad">
        <div className="section-label">Our process</div>
        <div className="process-steps">
          {steps.map(([step, text], index) => (
            <article key={step}>
              <span>0{index + 1}</span>
              <h2>{step}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="principles section-pad">
        <QuarterShape className="shape-accent principles-quarter" />
        <p className="eyebrow light">Four principles</p>
        <div>
          {principles.map(([title, text], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
