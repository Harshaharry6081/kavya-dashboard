import React from 'react'
import { Link } from 'react-router-dom'
import styles from './BookCard.module.css'

const SHELF_META = {
  want:    { label: '📚 Want to Read', color: '#4f46e5', bg: '#eef2ff' },
  reading: { label: '📖 Reading',      color: '#0284c7', bg: '#e0f2fe' },
  done:    { label: '✅ Completed',     color: '#16a34a', bg: '#dcfce7' },
  fav:     { label: '❤️ Favourite',    color: '#dc2626', bg: '#fee2e2' },
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80'

export default function BookCard({ book, compact = false }) {
  const meta = SHELF_META[book.shelf] || SHELF_META.want

  return (
    <Link to={`/book/${book.id}`} className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.cover}>
        <img
          src={book.cover || PLACEHOLDER}
          alt={book.title}
          onError={e => { e.target.src = PLACEHOLDER }}
        />
        <div className={styles.shelfBadge} style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.genre}>{book.genre || 'Fiction'}</div>
        <div className={styles.title}>{book.title}</div>
        <div className={styles.author}>{book.author}</div>
        {book.rating > 0 && (
          <div className={styles.stars}>
            {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
          </div>
        )}
        {book.dateCompleted && (
          <div className={styles.date}>Finished {book.dateCompleted}</div>
        )}
      </div>
    </Link>
  )
}
