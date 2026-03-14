import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Shelf from './pages/Shelf'
import BookDetail from './pages/BookDetail'
import AddBook from './pages/AddBook'
import { subscribeBooks } from './firebase/books'

export default function App() {
  const [books, setBooks] = useState([])
  const [dark, setDark] = useState(() => localStorage.getItem('kb-theme') === 'dark')

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('kb-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const unsub = subscribeBooks(setBooks)
    return () => unsub()
  }, [])

  return (
    <>
      <Navbar dark={dark} onToggleTheme={() => setDark(d => !d)} />
      <Routes>
        <Route path="/"           element={<Home books={books} />} />
        <Route path="/shelf/:shelf" element={<Shelf books={books} />} />
        <Route path="/book/:id"   element={<BookDetail books={books} />} />
        <Route path="/add"        element={<AddBook />} />
        <Route path="/edit/:id"   element={<AddBook books={books} />} />
      </Routes>
    </>
  )
}
