Project Name: Kavya's Vibe Dashboard
Type: Static Frontend Web App
Tech Stack: Pure HTML + CSS + JavaScript (zero dependencies, zero frameworks)
File Count: 1 file (index.html) — fully self-contained
Hosting: Any static host — Netlify Drop, GitHub Pages, Vercel

🎨 Design Details
Aesthetic Direction: Warm editorial / soft luxury
Color Palette:

Cream background #fdf6ed — easy on the eyes, cozy feel
Amber accent #e8843a — the primary brand color, warm and friendly
Ferrari Red #dc2626 — used exclusively in the F1 section
Deep coffee brown #2c1810 — for the coffee card
Midnight navy #1a1a2e — for the music card
Sage green #6b7c5e — for the mood section

Typography:

DM Serif Display — headings, quotes, card titles (elegant, editorial)
DM Sans — body text, buttons (clean, modern)
Playfair Display Italic — daily quote text (literary feel)

Visual Effects:

Grain texture overlay on the entire page
Staggered card fade-up animations on load
Steam animation on the coffee cup
Pulsing music note animation
Live progress bar on the music card
Hover lift effect on every card


⚙️ Functional Features
FeatureHow It WorksLive Date & TimeUpdates every 60 seconds using JS DateF1 Race CountdownCounts down to Bahrain GP (March 20, 2026) in days/hours/minsMood GeneratorRandomly picks from 12 moods, animates on each clickMusic ShufflePicks from 10 Hindi songs, resets the progress bar animationQuote RefreshRotates 10 quotes with a fade transition, never repeats back-to-backEaster EggHidden click reveals a warm personal message

📁 File Structure
kavya-dashboard/
└── index.html       ← Everything: HTML + CSS + JS in one file
No build tools, no npm install, no node_modules. Open in any browser and it just works
