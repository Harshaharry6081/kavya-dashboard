import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Shelf from './pages/Shelf'
import BookDetail from './pages/BookDetail'
import AddBook from './pages/AddBook'
import EpubReader from './pages/EpubReader'
import { subscribeBooks } from './firebase/books'
import { auth, provider } from './firebase/config'

export default function App() {
  const [books, setBooks] = useState([])
  const [dark, setDark] = useState(() => localStorage.getItem('kb-theme') === 'dark')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /* Auth form states */
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('kb-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) {
       setBooks([])
       return
    }
    const unsub = subscribeBooks(setBooks)
    return () => unsub()
  }, [user])

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      if (isSignUp) {
        if (!name.trim()) return setAuthError("First name is required")
        const res = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(res.user, { displayName: name.trim() })
        setUser({ ...res.user, displayName: name.trim() }) // Force update for immediate render
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch(err) {
      console.error(err)
      setAuthError(err.message.replace('Firebase: ', ''))
    }
  }

  const handleGoogleLogin = async () => {
    setAuthError('')
    try {
      await signInWithPopup(auth, provider)
    } catch(err) {
      console.error(err)
      setAuthError(err.message.replace('Firebase: ', ''))
    }
  }

  if (loading) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',background:'var(--cream)',color:'var(--text-dark)'}}>Loading...</div>

  if (!user) {
    return (
      <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',alignItems:'center',justifyContent:'center',background: dark ? '#0a0a0a' : '#f9f6f0',color: dark ? '#fff' : '#1a1a1a', padding: '20px'}}>
        <h1 style={{fontFamily:'"DM Serif Display", serif',fontSize:'clamp(2.5rem, 5vw, 3.5rem)',marginBottom:'10px'}}>Dashboard Login</h1>
        <p style={{marginBottom:'30px',color: dark ? '#a3a3a3' : '#666', fontSize:'1.1rem'}}>Please sign in to access your personal workspace.</p>
        
        <form onSubmit={handleEmailAuth} style={{display:'flex', flexDirection:'column', gap:'16px', width:'100%', maxWidth:'320px', marginBottom:'24px'}}>
          {isSignUp && (
            <input 
              type="text" 
              placeholder="First Name" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              required 
              style={{padding:'12px', borderRadius:'8px', border: dark ? '1px solid #404040' : '1px solid #e5e5e5', background: dark ? '#262626' : '#fff', color: dark ? '#fff' : '#000', fontSize:'1rem'}}
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required 
            style={{padding:'12px', borderRadius:'8px', border: dark ? '1px solid #404040' : '1px solid #e5e5e5', background: dark ? '#262626' : '#fff', color: dark ? '#fff' : '#000', fontSize:'1rem'}}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required 
            style={{padding:'12px', borderRadius:'8px', border: dark ? '1px solid #404040' : '1px solid #e5e5e5', background: dark ? '#262626' : '#fff', color: dark ? '#fff' : '#000', fontSize:'1rem'}}
          />
          {authError && <div style={{color:'#ef4444', fontSize:'0.85rem', textAlign:'center', lineHeight:'1.4'}}>{authError}</div>}
          <button type="submit" style={{background:'var(--amber)',color:'white',padding:'12px',borderRadius:'8px',border:'none',fontSize:'16px',fontWeight:'600',cursor:'pointer',boxShadow:'0 4px 14px rgba(232,132,58,0.3)',transition:'transform 0.2s', marginTop:'4px'}}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px', color: dark ? '#666' : '#a3a3a3', fontSize:'0.85rem', width:'100%', maxWidth:'320px', textTransform:'uppercase', letterSpacing:'1px'}}>
          <div style={{flex:1, height:'1px', background: dark ? '#333' : '#e5e5e5'}}></div>
          <span>OR</span>
          <div style={{flex:1, height:'1px', background: dark ? '#333' : '#e5e5e5'}}></div>
        </div>

        <button onClick={handleGoogleLogin} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',background: dark ? '#262626' : 'white',color: dark ? '#fff' : '#000',padding:'12px 24px',width:'100%',maxWidth:'320px',borderRadius:'8px',border: dark ? '1px solid #404040' : '1px solid #e5e5e5',fontSize:'15px',fontWeight:'500',cursor:'pointer',boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',transition:'transform 0.2s'}}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20" height="20" alt="Google logo" />
          Continue with Google
        </button>

        <button onClick={() => {setIsSignUp(!isSignUp); setAuthError('');}} style={{marginTop:'28px', background:'none', border:'none', color: dark ? '#a3a3a3' : '#666', cursor:'pointer', fontSize:'0.95rem', fontWeight:'500', textDecoration:'underline', textUnderlineOffset:'4px'}}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    )
  }

  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Kavya'

  return (
    <>
      <Navbar dark={dark} onToggleTheme={() => setDark(d => !d)} user={user} />
      <Routes>
        <Route path="/"           element={<Dashboard books={books} dark={dark} onToggleTheme={() => setDark(d => !d)} userName={firstName} />} />
        <Route path="/shelf/:shelf" element={<Shelf books={books} />} />
        <Route path="/book/:id"   element={<BookDetail books={books} />} />
        <Route path="/add"        element={<AddBook />} />
        <Route path="/edit/:id"   element={<AddBook books={books} />} />
        <Route path="/reader/:bookId" element={<EpubReader />} />
      </Routes>
    </>
  )
}
