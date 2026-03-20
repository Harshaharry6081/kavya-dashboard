import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import styles from './Navbar.module.css'

export default function Navbar({ dark, onToggleTheme, user }) {
  const loc = useLocation()
  const isHome = loc.pathname === '/'
  const rawName = user?.displayName ? user.displayName.split(' ')[0] : 'Kavya'
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span>{firstName}'s <em>Dashboard</em></span>
        </Link>

        <div className={styles.actions}>
          {!isHome && (
            <Link to="/" className={styles.homeLink}>← Dashboard</Link>
          )}
          <Link to="/add" className={styles.addBtn}>+ Add Book</Link>
          <button className={styles.themeBtn} onClick={onToggleTheme} title="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
          {user && (
            <button onClick={handleLogout} title="Sign Out" style={{background:'transparent',border:'1px solid var(--border)',color:'var(--text-soft)',padding:'6px 14px',borderRadius:'100px',cursor:'pointer',fontSize:'0.9rem',marginLeft:'8px',transition:'all 0.2s'}}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
