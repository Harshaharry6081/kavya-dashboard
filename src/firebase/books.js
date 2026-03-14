import { ref, push, onValue, update, remove } from 'firebase/database'
import { db } from './config'

const BOOKS_REF = 'books/shelf'

export function subscribeBooks(callback) {
  const r = ref(db, BOOKS_REF)
  return onValue(r, snap => {
    const data = snap.val() || {}
    const books = Object.entries(data).map(([id, book]) => ({ id, ...book }))
    callback(books)
  })
}

export function addBook(book) {
  return push(ref(db, BOOKS_REF), {
    ...book,
    createdAt: Date.now()
  })
}

export function updateBook(id, updates) {
  return update(ref(db, `${BOOKS_REF}/${id}`), updates)
}

export function deleteBook(id) {
  return remove(ref(db, `${BOOKS_REF}/${id}`))
}
