import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { addBook, updateBook } from '../firebase/books'
import styles from './AddBook.module.css'

const SHELVES = [
  { key:'want',    label:'📚 Want to Read' },
  { key:'reading', label:'📖 Currently Reading' },
  { key:'done',    label:'✅ Completed' },
  { key:'fav',     label:'❤️ Favourite' },
]

const GENRES = ['Fiction','Non-Fiction','Fantasy','Romance','Mystery','Sci-Fi','Self-Help','Biography','Poetry','Other']

const EMPTY = { title:'', author:'', cover:'', shelf:'want', genre:'Fiction', rating:0, dateCompleted:'' }

export default function AddBook({ books = [] }) {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const isEdit     = !!id
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (isEdit) {
      const book = books.find(b => b.id === id)
      if (book) { setForm({ ...EMPTY, ...book }); setPreview(book.cover || '') }
    }
  }, [id, books])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { alert('Please enter a book title!'); return }
    setSaving(true)
    try {
      if (isEdit) await updateBook(id, form)
      else        await addBook(form)
      navigate(-1)
    } catch(e) {
      alert('Failed to save. Check Firebase rules.'); setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isEdit ? '✏️ Edit Book' : '📚 Add New Book'}</h1>
        <p className={styles.sub}>{isEdit ? 'Update the book details below.' : 'Fill in the details and add to your shelf.'}</p>

        <div className={styles.layout}>
          {/* Cover preview */}
          <div className={styles.coverSide}>
            <div className={styles.coverPreview}>
              {preview
                ? <img src={preview} alt="cover" onError={()=>setPreview('')}/>
                : <div className={styles.coverPlaceholder}>📖<br/><span>Cover Preview</span></div>
              }
            </div>
            <input
              className={styles.input}
              placeholder="Cover image URL (optional)"
              value={form.cover}
              onChange={e => { set('cover', e.target.value); setPreview(e.target.value) }}
            />
          </div>

          {/* Form fields */}
          <div className={styles.formSide}>
            <div className={styles.field}>
              <label className={styles.label}>Book Title *</label>
              <input className={styles.input} placeholder="e.g. The Alchemist"
                value={form.title} onChange={e=>set('title',e.target.value)}/>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Author</label>
              <input className={styles.input} placeholder="e.g. Paulo Coelho"
                value={form.author} onChange={e=>set('author',e.target.value)}/>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Shelf</label>
                <select className={styles.select} value={form.shelf} onChange={e=>set('shelf',e.target.value)}>
                  {SHELVES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Genre</label>
                <select className={styles.select} value={form.genre} onChange={e=>set('genre',e.target.value)}>
                  {GENRES.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Your Rating</label>
              <StarRating value={form.rating} onChange={v=>set('rating',v)}/>
            </div>

            {(form.shelf === 'done' || form.shelf === 'fav') && (
              <div className={styles.field}>
                <label className={styles.label}>Date Completed</label>
                <input className={styles.input} type="date"
                  value={form.dateCompleted} onChange={e=>set('dateCompleted',e.target.value)}/>
              </div>
            )}

            <div className={styles.actions}>
              <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : isEdit ? '✅ Save Changes' : '📚 Add to Shelf'}
              </button>
              <button className={styles.cancelBtn} onClick={()=>navigate(-1)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
