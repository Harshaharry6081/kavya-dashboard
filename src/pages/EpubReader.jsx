import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ePub from 'epubjs'
import localforage from 'localforage'
import styles from './EpubReader.module.css'

const booksStore = localforage.createInstance({ name: 'kavya-epub', storeName: 'books' })

const THEMES = {
  cream:  { background: '#f5f0e8', color: '#2c1a0e', name: '🌿 Cream' },
  dark:   { background: '#1a1a2e', color: '#e8e0d0', name: '🌙 Dark'  },
  sepia:  { background: '#2c1a0a', color: '#f0d9a0', name: '☕ Sepia'  },
}

export default function EpubReader() {
  const { bookId } = useParams()
  const navigate = useNavigate()

  const viewerRef = useRef(null)
  const bookRef   = useRef(null)
  const rendRef   = useRef(null)

  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [fontSize, setFontSize] = useState(100)
  const [theme, setTheme]       = useState('cream')
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const controlsTimer = useRef(null)

  /* ── Load & render book ── */
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const bookMeta = await booksStore.getItem(bookId)
        const data     = await booksStore.getItem(`${bookId}_data`)
        if (!bookMeta || !data) { setError('Book not found in your library.'); return }

        if (!cancelled) setMeta(bookMeta)

        const book = ePub(data)
        bookRef.current = book

        await book.ready

        const rendition = book.renderTo(viewerRef.current, {
          width:  '100%',
          height: '100%',
          spread: 'none',
        })
        rendRef.current = rendition

        /* Apply initial theme & font */
        applyTheme(rendition, theme, fontSize)

        /* Resume from saved position or start */
        if (bookMeta.currentCfi) {
          await rendition.display(bookMeta.currentCfi)
        } else {
          await rendition.display()
        }

        /* Track location changes */
        rendition.on('relocated', (location) => {
          if (cancelled) return
          const cfi = location.start.cfi
          const pct = book.locations.percentageFromCfi(cfi) * 100 || 0
          setProgress(Math.round(pct))
          /* Save progress */
          booksStore.getItem(bookId).then(entry => {
            if (entry) {
              booksStore.setItem(bookId, {
                ...entry,
                currentCfi: cfi,
                progress: Math.round(pct),
              })
            }
          })
        })

        /* Generate locations for % tracking */
        book.locations.generate(1024)

        if (!cancelled) setLoading(false)
      } catch (err) {
        console.error('Reader error:', err)
        if (!cancelled) setError('Failed to open this book. It may be corrupted.')
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      rendRef.current?.destroy()
      bookRef.current?.destroy()
    }
  }, [bookId])

  /* ── Theme & font helpers ── */
  const applyTheme = (rend, t, fs) => {
    if (!rend) return
    const th = THEMES[t]
    rend.themes.override('body', {
      'background': th.background,
      'color':      th.color,
      'font-size':  `${fs}%`,
      'line-height': '1.8',
      'padding':    '0 2em',
    })
    rend.themes.override('*', { 'color': th.color })
  }

  useEffect(() => {
    if (rendRef.current) applyTheme(rendRef.current, theme, fontSize)
  }, [theme, fontSize])

  /* ── Controls auto-hide ── */
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => setShowControls(false), 3500)
  }, [])

  useEffect(() => {
    resetControlsTimer()
    return () => clearTimeout(controlsTimer.current)
  }, [])

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const handler = (e) => {
      resetControlsTimer()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const next = () => rendRef.current?.next()
  const prev = () => rendRef.current?.prev()

  const changeFontSize = (delta) => {
    setFontSize(prev => Math.min(200, Math.max(60, prev + delta)))
  }

  const cycleTheme = () => {
    const keys = Object.keys(THEMES)
    const idx  = keys.indexOf(theme)
    setTheme(keys[(idx + 1) % keys.length])
  }

  /* ── Error state ── */
  if (error) return (
    <div className={styles.errorPage}>
      <div className={styles.errorIcon}>📚</div>
      <div className={styles.errorMsg}>{error}</div>
      <button className={styles.backBtn} onClick={() => navigate('/')}>← Back to Dashboard</button>
    </div>
  )

  const currentTheme = THEMES[theme]

  return (
    <div
      className={styles.readerPage}
      style={{ background: currentTheme.background }}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Top bar */}
      <div className={`${styles.topBar} ${showControls ? styles.visible : ''}`}
           style={{ background: currentTheme.background + 'ee' }}>
        <button className={styles.iconBtn} onClick={() => navigate('/')} title="Back" style={{ color: currentTheme.color }}>
          ← Back
        </button>
        <div className={styles.bookTitleBar} style={{ color: currentTheme.color }}>
          {meta?.title || 'Reading…'}
        </div>
        <div className={styles.topRight}>
          <button className={styles.iconBtn} onClick={cycleTheme} title="Change theme" style={{ color: currentTheme.color }}>
            {currentTheme.name}
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Opening your book…</div>
        </div>
      )}

      {/* EPUB viewer */}
      <div ref={viewerRef} className={styles.viewer} />

      {/* Prev/Next click zones */}
      <div className={styles.prevZone} onClick={prev} title="Previous page" />
      <div className={styles.nextZone} onClick={next} title="Next page" />

      {/* Bottom controls */}
      <div className={`${styles.bottomBar} ${showControls ? styles.visible : ''}`}
           style={{ background: currentTheme.background + 'ee' }}>
        <button className={styles.navBtn} onClick={prev} style={{ color: currentTheme.color }}>
          ‹ Prev
        </button>
        <div className={styles.centerControls}>
          <button className={styles.fontBtn} onClick={() => changeFontSize(-10)} style={{ color: currentTheme.color }}>A−</button>
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progressLabel} style={{ color: currentTheme.color }}>{progress}%</div>
          </div>
          <button className={styles.fontBtn} onClick={() => changeFontSize(10)} style={{ color: currentTheme.color }}>A+</button>
        </div>
        <button className={styles.navBtn} onClick={next} style={{ color: currentTheme.color }}>
          Next ›
        </button>
      </div>
    </div>
  )
}
