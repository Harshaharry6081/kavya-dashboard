# 📚 Kavya's Book Shelf

A beautiful multi-page book tracker built with **React + Vite + Firebase**.

## Pages
- **Home** — stats overview, shelf cards, currently reading, recently completed
- **Shelf pages** — Want to Read / Reading / Completed / Favourites with search + sort + filter
- **Book Detail** — full view, move between shelves, rate, edit, delete
- **Add / Edit Book** — form with cover preview, genre, rating, date

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 3. Build for production
```bash
npm run build
```

### 4. Deploy to Netlify
```bash
# Option A — Netlify CLI
npm run build
netlify deploy --prod --dir=dist

# Option B — Drag dist/ folder to netlify.com/drop
```

## Firebase
Already configured with your kavya-dashboard-143 project.
Make sure Realtime Database rules allow read/write.

## Tech Stack
- React 18
- React Router v6
- Vite 5
- Firebase Realtime Database
- CSS Modules
