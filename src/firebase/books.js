import { ref, push, onValue, update, remove } from 'firebase/database'
import { db, auth } from './config'

const getBooksRef = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return `users/${uid}/books/shelf`;
}

export function subscribeBooks(callback) {
  const r = ref(db, getBooksRef())
  return onValue(r, snap => {
    const data = snap.val() || {}
    const books = Object.entries(data).map(([id, book]) => ({ id, ...book }))
    callback(books)
  })
}

export function addBook(book) {
  return push(ref(db, getBooksRef()), {
    ...book,
    createdAt: Date.now()
  })
}

export function updateBook(id, updates) {
  return update(ref(db, `${getBooksRef()}/${id}`), updates)
}

export function deleteBook(id) {
  return remove(ref(db, `${getBooksRef()}/${id}`))
}
