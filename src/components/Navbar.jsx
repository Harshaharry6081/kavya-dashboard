import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'
import styles from './Navbar.module.css'

export default function Navbar({ dark, onToggleTheme, user }) {
  const loc = useLocation()
  const isHome = loc.pathname === '/'
  const rawName = user?.displayName ? user.displayName.split(' ')[0] : 'Kavya'
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(firstName)

  const handleSaveName = async (e) => {
    e.preventDefault()
    if (!tempName.trim()) return
    try {
      await updateProfile(auth.currentUser, { displayName: tempName.trim() })
      setEditingName(false)
      window.location.reload() // reload to cascade name change easily
    } catch(err) {
      console.error(err)
    }
  }

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
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            {!editingName && <span>{firstName}'s <em>Dashboard</em></span>}
          </Link>
          
          {user && (
            editingName ? (
              <form onSubmit={handleSaveName} style={{display:'flex', alignItems:'center', gap:'6px'}}>
                <input 
                  autoFocus
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  style={{fontFamily:'inherit', fontSize:'1rem', padding:'4px 8px', borderRadius:'6px', border:'1px solid var(--amber)', background:'var(--cream)', color:'var(--text-dark)', width:'120px'}}
                />
                <button type="submit" style={{background:'var(--amber)', color:'white', border:'none', borderRadius:'4px', padding:'4px 10px', fontSize:'0.85rem', cursor:'pointer', fontWeight: 600}}>Save</button>
                <button type="button" onClick={() => {setEditingName(false); setTempName(firstName);}} style={{background:'transparent', color:'var(--text-soft)', border:'none', cursor:'pointer', fontSize:'0.85rem'}}>Cancel</button>
              </form>
            ) : (
              <button 
                onClick={() => {setTempName(firstName); setEditingName(true);}} 
                title="Change Name"
                style={{background:'none', border:'none', cursor:'pointer', opacity:0.4, transition:'opacity 0.2s', fontSize:'0.9rem', display:'flex', alignItems:'center'}}
                onMouseEnter={e => e.target.style.opacity = 1}
                onMouseLeave={e => e.target.style.opacity = 0.4}
              >
                ✏️
              </button>
            )
          )}
        </div>

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
