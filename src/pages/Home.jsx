import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import BookCard from '../components/BookCard'
import styles from './Home.module.css'

const SHELVES = [
  { key:'want',    label:'Want to Read',      icon:'📚', color:'#4f46e5', bg:'#eef2ff' },
  { key:'reading', label:'Currently Reading', icon:'📖', color:'#0284c7', bg:'#e0f2fe' },
  { key:'done',    label:'Completed',         icon:'✅', color:'#16a34a', bg:'#dcfce7' },
  { key:'fav',     label:'Favourites',        icon:'❤️', color:'#dc2626', bg:'#fee2e2' },
]

const TABS = ['Overview', 'Book Shelf']

export default function Home({ books }) {
  const [tab, setTab] = useState('Overview')

  const total   = books.length
  const done    = books.filter(b => b.shelf === 'done').length
  const reading = books.filter(b => b.shelf === 'reading').length
  const want    = books.filter(b => b.shelf === 'want').length
  const favs    = books.filter(b => b.shelf === 'fav').length
  const ratedBooks = books.filter(b => b.rating > 0)
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((a, b) => a + b.rating, 0) / ratedBooks.length).toFixed(1)
    : '—'

  const recentlyRead = [...books]
    .filter(b => b.shelf === 'done')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3)

  const currentlyReading = books.filter(b => b.shelf === 'reading').slice(0, 3)

  return (
    <div className={styles.page}>
      {/* Dashboard Header */}
      <div className={styles.dashHeader}>
        <div>
          <div className={styles.dashTag}>✦ Personal Dashboard</div>
          <h1 className={styles.dashTitle}>Kavya's <em>Dashboard</em></h1>
          <p className={styles.dashSub}>Track your reading life, all in one place.</p>
        </div>
        <Link to="/add" className={styles.heroBtn}>+ Add a Book</Link>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'Overview' ? '📊 Overview' : '📚 Book Shelf'}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'Overview' && (
        <div className={styles.tabContent}>
          {/* Stats */}
          <div className={styles.statsRow}>
            {[
              { label:'Total Books',  value: total,      icon:'📚' },
              { label:'Completed',    value: done,       icon:'✅' },
              { label:'Reading Now',  value: reading,    icon:'📖' },
              { label:'Want to Read', value: want,       icon:'🔖' },
              { label:'Favourites',   value: favs,       icon:'❤️' },
              { label:'Avg Rating',   value: avgRating,  icon:'⭐' },
            ].map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className={styles.quoteCard}>
            <div className={styles.quoteIcon}>"</div>
            <div className={styles.quoteText}>
              A reader lives a thousand lives before he dies. The man who never reads lives only one.
            </div>
            <div className={styles.quoteAuthor}>— George R.R. Martin</div>
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
      )}

      {/* ── Book Shelf Tab ── */}
      {tab === 'Book Shelf' && (
        <div className={styles.tabContent}>
          <p className={styles.shelfIntro}>
            Browse your shelves — <strong>{total}</strong> {total === 1 ? 'book' : 'books'} tracked so far.
          </p>
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

          {total === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📚</div>
              <div className={styles.emptyTitle}>No books yet</div>
              <div className={styles.emptySub}>Add your first book to get started!</div>
              <Link to="/add" className={styles.heroBtn} style={{marginTop:16}}>+ Add First Book</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
