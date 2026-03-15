import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ePub from 'epubjs'
import localforage from 'localforage'
import styles from './EpubLibrary.module.css'

const booksStore = localforage.createInstance({ name: 'kavya-epub', storeName: 'books' })

export default function EpubLibrary() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  /* Load saved books on mount */
  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    const keys = await booksStore.keys()
    const loaded = []
    for (const key of keys) {
      const book = await booksStore.getItem(key)
      if (book) loaded.push(book)
    }
    loaded.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
    setBooks(loaded)
    setLoading(false)
  }

  const processFile = async (file) => {
    if (!file || !file.name.endsWith('.epub')) {
      alert('Please select a valid .epub file')
      return
    }
    setUploading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const book = ePub(arrayBuffer)
      await book.ready
      const meta = await book.loaded.metadata
      const coverUrl = await book.coverUrl()

      const id = `epub_${Date.now()}_${Math.random().toString(36).slice(2)}`
      const entry = {
        id,
        title: meta.title || file.name.replace('.epub', ''),
        author: meta.creator || 'Unknown Author',
        cover: coverUrl || null,
        addedAt: Date.now(),
        progress: 0,
        currentCfi: null,
      }

      /* Store the raw binary separately for reading */
      await booksStore.setItem(`${id}_data`, arrayBuffer)
      await booksStore.setItem(id, entry)

      setBooks(prev => [entry, ...prev])
    } catch (err) {
      console.error('Failed to process EPUB:', err)
      alert('Could not read this EPUB file. It might be DRM-protected or corrupted.')
    }
    setUploading(false)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Remove this book from your library?')) return
    await booksStore.removeItem(id)
    await booksStore.removeItem(`${id}_data`)
    setBooks(prev => prev.filter(b => b.id !== id))
  }

  const openBook = (id) => {
    navigate(`/reader/${id}`)
  }

  return (
    <div className={styles.library}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>📖 E-Reader</div>
          <h2 className={styles.title}>Your EPUB Library</h2>
          <p className={styles.sub}>
            {books.length === 0 ? 'No books yet — upload your first EPUB!' : `${books.length} book${books.length !== 1 ? 's' : ''} in your library`}
          </p>
        </div>
        <button
          className={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <span>+</span> Upload EPUB
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".epub,application/epub+zip"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
      </div>

      {/* Drop zone when no books */}
      {books.length === 0 && !loading && (
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <div className={styles.dropIcon}>📚</div>
          <div className={styles.dropTitle}>Drop your EPUB here</div>
          <div className={styles.dropSub}>or click to browse your files</div>
        </div>
      )}

      {/* Books grid */}
      {loading && (
        <div className={styles.loadingRow}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      )}

      {!loading && books.length > 0 && (
        <>
          {/* Drop zone strip when books exist */}
          <div
            className={`${styles.dropStrip} ${dragOver ? styles.dropStripActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            📂 Drop an EPUB here to add it
          </div>

          <div className={styles.grid}>
            {books.map(book => (
              <div key={book.id} className={styles.card} onClick={() => openBook(book.id)}>
                <div className={styles.coverWrap}>
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className={styles.cover} />
                  ) : (
                    <div className={styles.coverPlaceholder}>
                      <span>📖</span>
                    </div>
                  )}
                  {book.progress > 0 && (
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.bookTitle}>{book.title}</div>
                  <div className={styles.bookAuthor}>{book.author}</div>
                  {book.progress > 0 && (
                    <div className={styles.progressLabel}>{Math.round(book.progress)}% read</div>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.readBtn} onClick={() => openBook(book.id)}>
                    {book.progress > 0 ? '▶ Continue' : '▶ Read'}
                  </button>
                  <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, book.id)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
