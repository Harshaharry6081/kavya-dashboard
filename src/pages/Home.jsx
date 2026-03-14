import React from 'react'
import { Link } from 'react-router-dom'
import BookCard from '../components/BookCard'
import styles from './Home.module.css'

const SHELVES = [
  { key:'want',    label:'Want to Read', icon:'📚', color:'#4f46e5', bg:'#eef2ff' },
  { key:'reading', label:'Currently Reading', icon:'📖', color:'#0284c7', bg:'#e0f2fe' },
  { key:'done',    label:'Completed',    icon:'✅', color:'#16a34a', bg:'#dcfce7' },
  { key:'fav',     label:'Favourites',   icon:'❤️', color:'#dc2626', bg:'#fee2e2' },
]

export default function Home({ books }) {
  const total   = books.length
  const done    = books.filter(b => b.shelf === 'done').length
  const reading = books.filter(b => b.shelf === 'reading').length
  const want    = books.filter(b => b.shelf === 'want').length
  const favs    = books.filter(b => b.shelf === 'fav').length
  const avgRating = books.filter(b=>b.rating>0).length
    ? (books.filter(b=>b.rating>0).reduce((a,b)=>a+b.rating,0) / books.filter(b=>b.rating>0).length).toFixed(1)
    : '—'

  const recentlyRead = [...books]
    .filter(b => b.shelf === 'done')
    .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3)

  const currentlyReading = books.filter(b => b.shelf === 'reading').slice(0, 3)

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.heroTag}>✦ Your reading world</div>
          <h1 className={styles.heroTitle}>
            Kavya's <em>Book Shelf</em>
          </h1>
          <p className={styles.heroSub}>
            Every book you've loved, are loving, or will love — all in one place.
          </p>
          <Link to="/add" className={styles.heroBtn}>+ Add a New Book</Link>
        </div>
        <div className={styles.heroQuote}>
          <div className={styles.quoteIcon}>"</div>
          <div className={styles.quoteText}>
            A reader lives a thousand lives before he dies. The man who never reads lives only one.
          </div>
          <div className={styles.quoteAuthor}>— George R.R. Martin</div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label:'Total Books',  value:total,     icon:'📚' },
          { label:'Completed',    value:done,       icon:'✅' },
          { label:'Reading Now',  value:reading,    icon:'📖' },
          { label:'Want to Read', value:want,       icon:'🔖' },
          { label:'Favourites',   value:favs,       icon:'❤️' },
          { label:'Avg Rating',   value:avgRating,  icon:'⭐' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Shelf Cards */}
      <div className={styles.shelvesGrid}>
        {SHELVES.map(sh => {
          const count = books.filter(b => b.shelf === sh.key).length
          return (
            <Link key={sh.key} to={`/shelf/${sh.key}`} className={styles.shelfCard}
              style={{ '--shelf-color': sh.color, '--shelf-bg': sh.bg }}>
              <div className={styles.shelfIcon}>{sh.icon}</div>
              <div className={styles.shelfLabel}>{sh.label}</div>
              <div className={styles.shelfCount}>{count} {count === 1 ? 'book' : 'books'}</div>
              <div className={styles.shelfArrow}>→</div>
            </Link>
          )
        })}
      </div>

      {/* Currently Reading */}
      {currentlyReading.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📖 Currently Reading</h2>
            <Link to="/shelf/reading" className={styles.sectionLink}>See all →</Link>
          </div>
          <div className={styles.compactList}>
            {currentlyReading.map(b => <BookCard key={b.id} book={b} compact />)}
          </div>
        </section>
      )}

      {/* Recently Completed */}
      {recentlyRead.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>✅ Recently Completed</h2>
            <Link to="/shelf/done" className={styles.sectionLink}>See all →</Link>
          </div>
          <div className={styles.compactList}>
            {recentlyRead.map(b => <BookCard key={b.id} book={b} compact />)}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📚</div>
          <div className={styles.emptyTitle}>Your shelf is empty</div>
          <div className={styles.emptySub}>Start by adding your first book!</div>
          <Link to="/add" className={styles.heroBtn} style={{marginTop:16}}>+ Add First Book</Link>
        </div>
      )}
    </div>
  )
}
