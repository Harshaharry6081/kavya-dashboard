import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import BookCard from '../components/BookCard'
import styles from './Shelf.module.css'

const SHELF_META = {
  want:    { label:'Want to Read', icon:'📚', color:'#4f46e5', desc:'Books on your reading wishlist' },
  reading: { label:'Currently Reading', icon:'📖', color:'#0284c7', desc:'Books you are reading right now' },
  done:    { label:'Completed', icon:'✅', color:'#16a34a', desc:'Books you have finished reading' },
  fav:     { label:'Favourites', icon:'❤️', color:'#dc2626', desc:'Books that left a mark on you' },
}

const GENRES = ['All','Fiction','Non-Fiction','Fantasy','Romance','Mystery','Sci-Fi','Self-Help','Biography','Poetry','Other']
const SORTS  = ['Newest','Oldest','Title A-Z','Title Z-A','Highest Rated','Lowest Rated']

export default function Shelf({ books }) {
  const { shelf } = useParams()
  const meta = SHELF_META[shelf] || SHELF_META.want
  const [search, setSearch]   = useState('')
  const [genre,  setGenre]    = useState('All')
  const [sort,   setSort]     = useState('Newest')

  const filtered = useMemo(() => {
    let list = books.filter(b => b.shelf === shelf)
    if (search) list = list.filter(b =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()))
    if (genre !== 'All') list = list.filter(b => b.genre === genre)
    switch(sort) {
      case 'Oldest':        list = [...list].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)); break
      case 'Title A-Z':     list = [...list].sort((a,b)=>a.title?.localeCompare(b.title)); break
      case 'Title Z-A':     list = [...list].sort((a,b)=>b.title?.localeCompare(a.title)); break
      case 'Highest Rated': list = [...list].sort((a,b)=>(b.rating||0)-(a.rating||0)); break
      case 'Lowest Rated':  list = [...list].sort((a,b)=>(a.rating||0)-(b.rating||0)); break
      default:              list = [...list].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))
    }
    return list
  }, [books, shelf, search, genre, sort])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header} style={{ '--shelf-color': meta.color }}>
        <div className={styles.headerIcon}>{meta.icon}</div>
        <div>
          <h1 className={styles.title}>{meta.label}</h1>
          <p className={styles.desc}>{meta.desc} · <strong>{filtered.length}</strong> {filtered.length===1?'book':'books'}</p>
        </div>
        <Link to="/add" className={styles.addBtn}>+ Add Book</Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="Search title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={styles.select} value={genre} onChange={e=>setGenre(e.target.value)}>
          {GENRES.map(g => <option key={g}>{g}</option>)}
        </select>
        <select className={styles.select} value={sort} onChange={e=>setSort(e.target.value)}>
          {SORTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map(b => <BookCard key={b.id} book={b} />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>{meta.icon}</div>
          <div className={styles.emptyTitle}>No books here yet</div>
          <div className={styles.emptySub}>
            {search || genre !== 'All'
              ? 'Try clearing your filters'
              : 'Add your first book to this shelf!'}
          </div>
          <Link to="/add" className={styles.addBtn} style={{marginTop:20}}>+ Add Book</Link>
        </div>
      )}
    </div>
  )
}
