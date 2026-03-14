import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { updateBook, deleteBook } from '../firebase/books'
import styles from './BookDetail.module.css'

const SHELF_META = {
  want:    { label:'Want to Read',       icon:'📚', color:'#4f46e5', bg:'#eef2ff' },
  reading: { label:'Currently Reading',  icon:'📖', color:'#0284c7', bg:'#e0f2fe' },
  done:    { label:'Completed',          icon:'✅', color:'#16a34a', bg:'#dcfce7' },
  fav:     { label:'Favourite',          icon:'❤️', color:'#dc2626', bg:'#fee2e2' },
}

const MOVE_OPTIONS = [
  { key:'want',    label:'📚 Move to Want to Read' },
  { key:'reading', label:'📖 Move to Currently Reading' },
  { key:'done',    label:'✅ Mark as Completed' },
  { key:'fav',     label:'❤️ Add to Favourites' },
]

const PLACEHOLDER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80'

export default function BookDetail({ books }) {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const book      = books.find(b => b.id === id)
  const [moving, setMoving] = useState(false)

  if (!book) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>📚</div>
      <div className={styles.notFoundTitle}>Book not found</div>
      <Link to="/" className={styles.backBtn}>← Go Home</Link>
    </div>
  )

  const meta = SHELF_META[book.shelf] || SHELF_META.want

  const handleDelete = async () => {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return
    await deleteBook(id)
    navigate(-1)
  }

  const handleMove = async (shelf) => {
    setMoving(true)
    await updateBook(id, { shelf })
    setMoving(false)
  }

  const handleRating = async (rating) => {
    await updateBook(id, { rating })
  }

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.backBtn} onClick={()=>navigate(-1)}>← Back</button>

      <div className={styles.layout}>
        {/* Left — cover */}
        <div className={styles.left}>
          <div className={styles.coverWrap}>
            <img
              src={book.cover || PLACEHOLDER}
              alt={book.title}
              onError={e=>{ e.target.src = PLACEHOLDER }}
              className={styles.cover}
            />
          </div>

          {/* Shelf badge */}
          <div className={styles.shelfBadge} style={{ background: meta.bg, color: meta.color }}>
            {meta.icon} {meta.label}
          </div>

          {/* Rating */}
          <div className={styles.ratingSection}>
            <div className={styles.sectionLabel}>Your Rating</div>
            <StarRating value={book.rating || 0} onChange={handleRating} />
          </div>

          {/* Move shelf */}
          <div className={styles.moveSection}>
            <div className={styles.sectionLabel}>Move to Shelf</div>
            <div className={styles.moveBtns}>
              {MOVE_OPTIONS.filter(o => o.key !== book.shelf).map(o => (
                <button
                  key={o.key}
                  className={styles.moveBtn}
                  onClick={() => handleMove(o.key)}
                  disabled={moving}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — info */}
        <div className={styles.right}>
          <div className={styles.genre}>{book.genre || 'Fiction'}</div>
          <h1 className={styles.title}>{book.title}</h1>
          <div className={styles.author}>by {book.author || 'Unknown Author'}</div>

          {book.rating > 0 && (
            <div className={styles.stars}>
              {'★'.repeat(book.rating)}{'☆'.repeat(5-book.rating)}
              <span className={styles.ratingNum}> {book.rating}/5</span>
            </div>
          )}

          <div className={styles.metaGrid}>
            {book.dateCompleted && (
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Date Completed</div>
                <div className={styles.metaValue}>📅 {book.dateCompleted}</div>
              </div>
            )}
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}>Added On</div>
              <div className={styles.metaValue}>
                🕐 {new Date(book.createdAt).toLocaleDateString('en-IN',{dateStyle:'medium'})}
              </div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}>Genre</div>
              <div className={styles.metaValue}>📖 {book.genre}</div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}>Shelf</div>
              <div className={styles.metaValue}>{meta.icon} {meta.label}</div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Link to={`/edit/${id}`} className={styles.editBtn}>✏️ Edit Book</Link>
            <button className={styles.deleteBtn} onClick={handleDelete}>🗑 Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
