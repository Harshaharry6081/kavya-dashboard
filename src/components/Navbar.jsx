import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const shelves = [
  { key: 'want',    label: '📚 Want to Read' },
  { key: 'reading', label: '📖 Reading' },
  { key: 'done',    label: '✅ Completed' },
  { key: 'fav',     label: '❤️ Favourites' },
]

export default function Navbar({ dark, onToggleTheme }) {
  const loc = useLocation()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span>Kavya's <em>Book Shelf</em></span>
        </Link>

        <div className={styles.links}>
          {shelves.map(s => (
            <Link
              key={s.key}
              to={`/shelf/${s.key}`}
              className={`${styles.link} ${loc.pathname === `/shelf/${s.key}` ? styles.active : ''}`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <Link to="/add" className={styles.addBtn}>+ Add Book</Link>
          <button className={styles.themeBtn} onClick={onToggleTheme} title="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
