import Link from 'next/link'
import { papers } from '@/lib/papers'

export default function NotFound() {
  return (
    <section className="void shell">
      <h1>Nothing is filed at this address.</h1>
      <p>
        The series is three papers and one summary page. Pick up wherever you like — the argument
        runs in order, but each document stands on its own hypotheses.
      </p>
      <div className="btn-row">
        {papers.map((p) => (
          <Link className="btn" key={p.id} href={`/${p.id}`}>
            {p.numeral}. {p.title}
          </Link>
        ))}
        <Link className="btn btn-solid" href="/argument">
          The argument in one page
        </Link>
      </div>
    </section>
  )
}
