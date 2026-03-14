import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar({ dark, onToggleTheme }) {
  const loc = useLocation()
  const isHome = loc.pathname === '/'

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span>Kavya's <em>Dashboard</em></span>
        </Link>

        <div className={styles.actions}>
          {!isHome && (
            <Link to="/" className={styles.homeLink}>← Dashboard</Link>
          )}
          <Link to="/add" className={styles.addBtn}>+ Add Book</Link>
          <button className={styles.themeBtn} onClick={onToggleTheme} title="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
