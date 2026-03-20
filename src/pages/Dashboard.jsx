import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ref, push, onValue, update, remove, set, get } from 'firebase/database'
import { db, auth } from '../firebase/config'
import BookCard from '../components/BookCard'
import EpubLibrary from './EpubLibrary'
import SpaceBoard from '../components/SpaceBoard'
import styles from './Dashboard.module.css'

/* ── Constants ────────────────────────────────────────── */
const TIME_SLOTS = [
  { range:[0,4],   greeting:'✦ Still up?',      title:"<em>Night Owl</em> Dashboard",  sub:'Late nights have their own kind of magic. 🌙', coffeeLabel:'🌙 Night Mode', coffeeIcon:'🌙', coffeeStatus:'Sleep might be better.<br/>But here you are.', coffeeSub:'The night is yours. ✨', coffeeBg:'linear-gradient(135deg,#0f0c29 0%,#1a1a2e 100%)' },
  { range:[4,6],   greeting:'✦ Early bird!',     title:"<em>Dawn</em> Dashboard",        sub:'The world is quiet. This hour is yours. 🌄', coffeeLabel:'🌄 Dawn Mode', coffeeIcon:'🌄', coffeeStatus:'First light.<br/>First cup.', coffeeSub:'You beat the sun today. ☕', coffeeBg:'linear-gradient(135deg,#1a0a00 0%,#7c3f00 100%)' },
  { range:[6,9],   greeting:'✦ Good morning',    title:"<em>Morning</em> Dashboard",     sub:'Soft light, warm cup, slow start. ☀️', coffeeLabel:'☕ Morning Mode', coffeeIcon:'☕', coffeeStatus:"Today's Status:<br/>Required.", coffeeSub:'Because some mornings just need one. ☕', coffeeBg:'linear-gradient(135deg,#2c1810 0%,#4a2c1a 100%)' },
  { range:[9,12],  greeting:'✦ Good morning',    title:"<em>Vibe</em> Dashboard",        sub:"Morning in full swing. You've got this. 💪", coffeeLabel:'☕ Second Cup?', coffeeIcon:'☕', coffeeStatus:'Second cup<br/>unlocked.', coffeeSub:"No one's counting. Refill away. ☕", coffeeBg:'linear-gradient(135deg,#2c1810 0%,#4a2c1a 100%)' },
  { range:[12,14], greeting:'✦ Good afternoon',  title:"<em>Midday</em> Dashboard",      sub:'Lunchtime. Breathe. Take a small break. 🍱', coffeeLabel:'🍵 Lunch Break', coffeeIcon:'🍵', coffeeStatus:'Midday Check-in:<br/>Eat something.', coffeeSub:'Food first. Hustle after. 🌿', coffeeBg:'linear-gradient(135deg,#1a3a1a 0%,#2d5a2d 100%)' },
  { range:[14,17], greeting:'✦ Good afternoon',  title:"<em>Afternoon</em> Dashboard",   sub:'The golden window of focus. 🌤', coffeeLabel:'☕ Afternoon Fuel', coffeeIcon:'☕', coffeeStatus:'Afternoon slump?<br/>Coffee says no.', coffeeSub:'One last cup to carry you through. ☕', coffeeBg:'linear-gradient(135deg,#2c1810 0%,#5c3820 100%)' },
  { range:[17,20], greeting:'✦ Good evening',    title:"<em>Evening</em> Dashboard",     sub:'Golden hour. Slow down a little. 🌅', coffeeLabel:'🫖 Evening Wind-down', coffeeIcon:'🫖', coffeeStatus:'Evening Mode:<br/>Tea time.', coffeeSub:'Chamomile or chai — your call. 🌿', coffeeBg:'linear-gradient(135deg,#1a0a1a 0%,#3d1a2e 100%)' },
  { range:[20,22], greeting:'✦ Good evening',    title:"<em>Night</em> Dashboard",       sub:'Winding down. One chapter and then sleep. 📖', coffeeLabel:'📖 Night Mode', coffeeIcon:'🌙', coffeeStatus:'Reading time:<br/>One chapter.', coffeeSub:'Close the screen soon. Rest well. 🌿', coffeeBg:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3d 100%)' },
  { range:[22,24], greeting:'✦ Still up?',        title:"<em>Late Night</em> Dashboard",  sub:'The quiet hours. Just you and your thoughts. 🌌', coffeeLabel:'🌌 Late Night Mode', coffeeIcon:'🌙', coffeeStatus:'Late night energy:<br/>Mysterious.', coffeeSub:'Tomorrow is a new canvas. 🌙', coffeeBg:'linear-gradient(135deg,#0a0010 0%,#1a0a2e 100%)' },
]

const MOODS = ['Chill day 🌿','Coffee + Deep Focus ☕','Take it slow today 🌤','Cozy reading mode 📖','Quiet & Productive 🤍','Low effort, high vibes ✨','Music on, world off 🎧','Good things are coming 🌸','Do one thing well today 🎯','Grateful and grounded 🍃','Let the day unfold 🌅','Soft day, warm heart ☀️']

const QUOTES = [
  'Rest is not laziness — it is the space where good ideas find you.',
  'Slow mornings are their own kind of luxury.',
  'Some days, simply being kind to yourself is enough.',
  'Not all progress is loud. Quiet growth counts too.',
  'The best chapters start with a deep breath.',
  "You don't need to explain your pace to anyone.",
  'There is beauty in the ordinary, if you slow down enough to see it.',
  'Do less, feel more.',
  'One good cup of coffee and a book — that\'s a perfect morning.',
  "It's okay to have a soft, gentle day.",
]

const BOOK_QUOTES = [
  '"One chapter is enough."',
  '"Not all those who wander are lost."',
  '"So many books, so little time."',
  '"A book is a dream you hold in your hands."',
]

const SHELVES = [
  { key:'want',    label:'Want to Read',      icon:'📚', color:'#4f46e5', bg:'#eef2ff' },
  { key:'reading', label:'Currently Reading', icon:'📖', color:'#0284c7', bg:'#e0f2fe' },
  { key:'done',    label:'Completed',         icon:'✅', color:'#16a34a', bg:'#dcfce7' },
  { key:'fav',     label:'Favourites',        icon:'❤️', color:'#dc2626', bg:'#fee2e2' },
]

const WEATHER_ICONS = {0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',61:'🌧',71:'❄️',80:'🌧',95:'⛈'}
const WEATHER_DESCS = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Foggy',51:'Drizzle',61:'Rain',71:'Snow',80:'Showers',95:'Thunderstorm'}

const TTT_WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
const GAME_WORDS = [
  {word:'FERRARI',hint:'Famous Italian F1 team 🏎'},{word:'COFFEE',hint:'Morning essential ☕'},{word:'MUSIC',hint:'Soul food 🎧'},
  {word:'GALAXY',hint:'Far, far away 🌌'},{word:'SUNSET',hint:'Golden hour 🌅'},{word:'KINDLE',hint:'Reading device 📖'},
  {word:'DREAMS',hint:'Eyes closed 💭'},{word:'BREEZE',hint:'Gentle wind 🌿'},{word:'MAGIC',hint:'Unexplained wonder ✨'},
]
const MEM_EMOJIS = ['🌸','🎸','🏎','☕','🎧','📖','✨','🌙']
const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅']

const PRIORITY_LABEL = { high:'🔴 High', medium:'🟡 Medium', low:'🟢 Low' }
const PRIORITY_CLASS = { high: styles.prioHigh, medium: styles.prioMed, low: styles.prioLow }
const PRIORITY_ORDER = { high:0, medium:1, low:2 }

function getTimeSlot(h) { return TIME_SLOTS.find(s => h >= s.range[0] && h < s.range[1]) || TIME_SLOTS[2] }
function checkTTTWin(b) { for(const [a,c,d] of TTT_WINS) if(b[a]&&b[a]===b[c]&&b[c]===b[d]) return b[a]; return null }

/* ── Component ────────────────────────────────────────── */
export default function Dashboard({ books = [], dark, onToggleTheme, userName = 'Kavya' }) {
  const uid = auth.currentUser?.uid || 'defaultUser'
  /* time */
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])
  const slot = getTimeSlot(now.getHours())

  /* f1 countdown */
  const [f1, setF1] = useState({ days:'--', hours:'--', mins:'--' })
  useEffect(() => {
    const tick = () => {
      const race = new Date('2026-03-29T10:30:00'), diff = race - new Date()
      if (diff > 0) setF1({ days: String(Math.floor(diff/86400000)).padStart(2,'0'), hours: String(Math.floor((diff%86400000)/3600000)).padStart(2,'0'), mins: String(Math.floor((diff%3600000)/60000)).padStart(2,'0') })
      else setF1({ days:'🏁', hours:'0', mins:'0' })
    }
    tick(); const t = setInterval(tick, 60000); return () => clearInterval(t)
  }, [])

  /* mood */
  const [mood, setMood] = useState("Press the button to reveal today's vibe ✨")
  const [moodKey, setMoodKey] = useState(0)
  const genMood = () => { setMood(MOODS[Math.floor(Math.random()*MOODS.length)]); setMoodKey(k=>k+1) }

  /* quote */
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)
  const refreshQuote = () => {
    setQuoteVisible(false)
    setTimeout(() => { let i; do { i = Math.floor(Math.random()*QUOTES.length) } while(i===quoteIdx); setQuoteIdx(i); setQuoteVisible(true) }, 220)
  }

  /* book quote */
  const bookQuote = useMemo(() => BOOK_QUOTES[Math.floor(Math.random()*BOOK_QUOTES.length)], [])

  /* weather */
  const [weather, setWeather] = useState(null)
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude:lat, longitude:lon } = pos.coords
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code`)
        .then(r=>r.json()).then(d => {
          const c = d.current
          setWeather({ temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature), humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m), icon: WEATHER_ICONS[c.weather_code]||'🌤', desc: WEATHER_DESCS[c.weather_code]||'Clear' })
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`).then(r=>r.json()).then(g => {
            const city = g.address?.city || g.address?.town || g.address?.village || 'Your Location'
            setWeather(w => ({...w, city}))
          }).catch(()=>{})
        }).catch(()=>{})
    }, ()=>{})
  }, [])

  /* easter egg */
  const [easterRevealed, setEasterRevealed] = useState(false)

  /* music */
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [lastPlayed, setLastPlayed] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null)
  const [addingPlaylist, setAddingPlaylist] = useState(false)
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('')
  const [newPlaylistName, setNewPlaylistName] = useState('')

  useEffect(() => {
    if (!uid) return
    const unsubLast = onValue(ref(db, `users/${uid}/music/lastPlayed`), snap => {
      const data = snap.val()
      if (data) {
        setLastPlayed(data)
        if (data.playlistId) {
          setCurrentPlaylistId(prev => prev ? prev : data.playlistId)
        }
      }
    })
    const unsubLists = onValue(ref(db, `users/${uid}/music/playlists`), snap => {
      const data = snap.val()
      if (data) {
        const arr = Object.values(data).sort((a,b) => a.addedAt - b.addedAt)
        setPlaylists(arr)
        setCurrentPlaylistId(prev => prev ? prev : (arr.length > 0 ? arr[0].id : null))
      } else {
        /* Default fallback playlist if DB is empty */
        const def = { id: 'default', name: `${userName}'s Defaults`, url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX5q67ZpWyRrZ?utm_source=generator&theme=0&autoplay=1", addedAt: Date.now() }
        setPlaylists([def])
        setCurrentPlaylistId(prev => prev ? prev : 'default')
        set(ref(db, `users/${uid}/music/playlists/default`), def)
      }
    })
    return () => { unsubLast(); unsubLists() }
  }, [uid, userName])

  const parseSpotifyUrl = (url) => {
    try {
      if (url.includes('open.spotify.com/playlist/')) {
        const id = url.split('playlist/')[1].split('?')[0]
        return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0&autoplay=1`
      }
      if (url.includes('open.spotify.com/embed/')) return url
      return null
    } catch { return null }
  }

  const saveNewPlaylist = () => {
    if (!newPlaylistName.trim() || !newPlaylistUrl.trim()) return
    const embedUrl = parseSpotifyUrl(newPlaylistUrl)
    if (!embedUrl) { alert('Please enter a valid Spotify Playlist link.'); return }
    
    const id = `pl_${Date.now()}`
    set(ref(db, `users/${uid}/music/playlists/${id}`), { id, name: newPlaylistName.trim(), url: embedUrl, addedAt: Date.now() })
    setCurrentPlaylistId(id)
    setAddingPlaylist(false)
    setNewPlaylistUrl('')
    setNewPlaylistName('')
  }
  
  const deletePlaylist = (id) => {
    if(!confirm('Are you sure you want to delete this playlist?')) return
    remove(ref(db, `users/${uid}/music/playlists/${id}`))
    if (currentPlaylistId === id) {
      const left = playlists.filter(p => p.id !== id)
      setCurrentPlaylistId(left.length > 0 ? left[0].id : null)
      setMusicPlaying(false)
    }
  }

  const startMusic = () => {
    setMusicPlaying(true)
    const now2 = new Date()
    const p = playlists.find(x => x.id === currentPlaylistId) || playlists[0]
    set(ref(db, `users/${uid}/music/lastPlayed`), { playlistId: p?.id || null, playlistName: p?.name || "Unknown", playedAt: now2.toISOString(), playedAtLabel: now2.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) })
  }

  /* note */
  const [note, setNote] = useState(null)
  const [noteEditing, setNoteEditing] = useState(false)
  const [noteText, setNoteText] = useState('')
  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, `users/${uid}/note/latest`), s=>setNote(s.val()));
    return ()=>unsub() 
  }, [uid])
  const saveNote = () => {
    if (!noteText.trim()) return
    const t = new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})
    set(ref(db, `users/${uid}/note/latest`), { text:noteText.trim(), from:'Someone who cares 💛', time:t })
    setNoteText(''); setNoteEditing(false)
  }

  /* main tabs */
  const [tab, setTab] = useState('overview')
  const MAIN_TABS = [{ key:'overview',  label:'🏠 Overview' },{ key:'planner', label:'✅ To-Do List' },{ key:'bookshelf',label:'📚 Reading & Shelf' },{ key:'games',    label:'🎮 Games' }]

  /* ── Day Planner (Firebase) ── */
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], [])
  const tasksRef = ref(db, `users/${uid}/planner/${todayKey}`)
  const [tasks, setTasks] = useState({})
  const [taskText, setTaskText] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [taskSlot, setTaskSlot] = useState('morning')
  const [taskPriority, setTaskPriority] = useState('medium')
  const [taskDue, setTaskDue] = useState('')
  
  const [draggedPlannerSlot, setDraggedPlannerSlot] = useState(null)
  const [plannerFilter, setPlannerFilter] = useState('all')
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    const unsub = onValue(tasksRef, snap => { setTasks(snap.val()||{}); setSynced(true) })
    return () => unsub()
  }, [todayKey])

  const filteredTasks = useMemo(() => {
    const all = Object.entries(tasks).map(([id,t])=>({id,...t}))
    return all.filter(t => {
      if(plannerFilter==='high') return t.priority==='high'
      if(plannerFilter==='medium') return t.priority==='medium'
      if(plannerFilter==='low') return t.priority==='low'
      if(plannerFilter==='done') return t.done
      if(plannerFilter==='pending') return !t.done
      return true
    }).sort((a,b) => {
      if(a.done!==b.done) return a.done?1:-1
      return (PRIORITY_ORDER[a.priority]??1)-(PRIORITY_ORDER[b.priority]??1)
    })
  }, [tasks, plannerFilter])

  const tasksBySlot = useMemo(() => ({
    morning:   filteredTasks.filter(t=>t.slot==='morning'),
    afternoon: filteredTasks.filter(t=>t.slot==='afternoon'),
    evening:   filteredTasks.filter(t=>t.slot==='evening'),
  }), [filteredTasks])

  const plannerStats = useMemo(() => {
    const all = Object.values(tasks)
    return { total:all.length, done:all.filter(t=>t.done).length, high:all.filter(t=>t.priority==='high').length, medium:all.filter(t=>!t.priority||t.priority==='medium').length, low:all.filter(t=>t.priority==='low').length }
  }, [tasks])

  const addTask = () => {
    if (!taskText.trim()) return
    push(tasksRef, { text:taskText.trim(), time:taskTime, slot:taskSlot, priority:taskPriority, due:taskDue, done:false, created:Date.now() })
    setTaskText(''); setTaskTime(''); setTaskDue('')
  }
  const toggleTask = (id, done) => update(ref(db,`users/${uid}/planner/${todayKey}/${id}`), {done:!done})
  const deleteTask = (id) => remove(ref(db,`users/${uid}/planner/${todayKey}/${id}`))
  const clearDone = () => {
    Object.keys(tasks).forEach(k => {
      if(tasks[k].done) remove(ref(db, `users/${uid}/planner/${todayKey}/${k}`))
    })
  }

  // --- Day Planner Drag & Drop ---
  const handlePlannerDragStart = (e, taskId) => {
    e.dataTransfer.setData('plannerTaskId', taskId)
  }
  const handlePlannerDragOver = (e, slotKey) => {
    e.preventDefault()
    setDraggedPlannerSlot(slotKey)
  }
  const handlePlannerDrop = async (e, slotKey) => {
    e.preventDefault()
    setDraggedPlannerSlot(null)
    const taskId = e.dataTransfer.getData('plannerTaskId')
    if(!taskId) return
    await update(ref(db, `users/${uid}/planner/${todayKey}/${taskId}`), { slot: slotKey })
  }
  /* ── Games ── */
  const [roomId, setRoomId] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [myRole, setMyRole] = useState(null)
  const [roomStatus, setRoomStatus] = useState('Enter a room name and your name to start playing together.')
  const [gameTab, setGameTab] = useState('ttt')
  const [inRoom, setInRoom] = useState(false)

  /* TTT */
  const [tttBoard, setTttBoard] = useState(Array(9).fill(''))
  const [tttTurn, setTttTurn] = useState('X')
  const [tttWinner, setTttWinner] = useState(null)
  const [tttDraw, setTttDraw] = useState(false)
  const [tttScores, setTttScores] = useState({X:0,O:0})
  const [tttStatus, setTttStatus] = useState('dummy')

  /* Word Guess */
  const [wordState, setWordState] = useState(null)
  const [letterInput, setLetterInput] = useState('')

  /* Dice */
  const [diceState, setDiceState] = useState({ scores:{host:0,guest:0}, lastRoll:null })
  const [diceRolling, setDiceRolling] = useState(false)

  /* Memory */
  const [memCards, setMemCards] = useState([])
  const [memTurn, setMemTurn] = useState('host')
  const [memFlipped, setMemFlipped] = useState([])
  const [memScores, setMemScores] = useState({host:0,guest:0})
  const [memStatus, setMemStatus] = useState('playing')

  useEffect(() => {
    if (!roomId || !inRoom) return
    const gameRef = ref(db, `games/${roomId}`)
    const unsub = onValue(gameRef, snap => {
      const data = snap.val() || {}
      /* TTT */
      if (data.ttt) { setTttBoard(data.ttt.board||Array(9).fill('')); setTttTurn(data.ttt.turn||'X'); setTttWinner(data.ttt.winner||null); setTttDraw(data.ttt.status==='draw'); setTttScores(data.ttt.scores||{X:0,O:0}) }
      /* Word */
      if (data.word) setWordState(data.word)
      /* Dice */
      if (data.dice) setDiceState(data.dice)
      /* Memory */
      if (data.memory) {
        const m = data.memory
        setMemCards(Object.values(m.cards||{}).sort((a,b)=>a.pos-b.pos))
        setMemTurn(m.turn||'host')
        setMemFlipped(m.flipped||[])
        setMemScores(m.scores||{host:0,guest:0})
        setMemStatus(m.status||'playing')
      }
    })
    return () => unsub()
  }, [roomId, inRoom])

  const joinRoom = async () => {
    const r = roomId.trim().toLowerCase().replace(/\s+/g,'')
    const n = playerName.trim()
    if (!r || !n) { alert('Enter room name and your name!'); return }
    const metaRef = ref(db, `games/${r}/meta`)
    const snap = await get(metaRef)
    let role
    if (!snap.exists()) {
      role = 'host'; await set(metaRef, { host:n, guest:'', created:Date.now() })
      setRoomStatus(`Room "${r}" created! You are ❌ — share with your friend.`)
    } else {
      const meta = snap.val()
      if (!meta.guest) { role = 'guest'; await update(metaRef, { guest:n }); setRoomStatus(`Joined "${r}"! You are ⭕`) }
      else { role = meta.host===n ? 'host' : 'guest'; setRoomStatus(`Reconnected to "${r}" as ${role==='host'?'❌':'⭕'}`) }
    }
    setMyRole(role); setInRoom(true)
    /* init games if needed */
    const tRef = ref(db, `games/${r}/ttt`)
    const ts = await get(tRef)
    if (!ts.exists()) await set(tRef, { board:Array(9).fill(''), turn:'X', scores:{X:0,O:0}, status:'playing', winner:null })
    const wRef = ref(db, `games/${r}/word`)
    const ws = await get(wRef)
    if (!ws.exists()) { const w = GAME_WORDS[Math.floor(Math.random()*GAME_WORDS.length)]; await set(wRef, { word:w.word, hint:w.hint, guessed:[], lives:6, status:'playing' }) }
    const dRef = ref(db, `games/${r}/dice`)
    const ds = await get(dRef)
    if (!ds.exists()) await set(dRef, { scores:{host:0,guest:0}, lastRoll:null })
    const memRef2 = ref(db, `games/${r}/memory`)
    const ms = await get(memRef2)
    if (!ms.exists()) { const cards = [...MEM_EMOJIS,...MEM_EMOJIS].sort(()=>Math.random()-0.5).reduce((o,e,i)=>{o[i]={pos:i,emoji:e,flipped:false,matched:false};return o},{}); await set(memRef2, { cards, turn:'host', flipped:[], scores:{host:0,guest:0}, status:'playing' }) }
  }

  const tttMove = async (i) => {
    if (!inRoom) return
    const r = ref(db, `games/${roomId}/ttt`)
    const snap = await get(r)
    const s = snap.val()
    if (!s || s.board[i] || s.status!=='playing') return
    const mySymbol = myRole==='host' ? 'X' : 'O'
    if (s.turn!==mySymbol) return
    const board = [...s.board]; board[i] = mySymbol
    const winner = checkTTTWin(board), draw = !winner && board.every(c=>c)
    const scores = {...(s.scores||{X:0,O:0})}
    if (winner) scores[winner] = (scores[winner]||0)+1
    await update(r, { board, turn:mySymbol==='X'?'O':'X', winner:winner||null, status:winner?'won':draw?'draw':'playing', scores })
  }

  const resetTTT = async () => {
    if (!inRoom) return
    const r = ref(db, `games/${roomId}/ttt`)
    const s = await get(r)
    await set(r, { board:Array(9).fill(''), turn:'X', scores:(s.val()?.scores||{X:0,O:0}), status:'playing', winner:null })
  }

  const guessLetter = async () => {
    const letter = letterInput.toUpperCase().trim()
    setLetterInput('')
    if (!letter || !/[A-Z]/.test(letter) || !inRoom) return
    const r = ref(db, `games/${roomId}/word`)
    const snap = await get(r)
    const s = snap.val()
    if (!s || s.status!=='playing') return
    const guessed = [...(s.guessed||[])]
    if (guessed.includes(letter)) return
    guessed.push(letter)
    const correct = s.word.includes(letter)
    const lives = correct ? s.lives : (s.lives||6)-1
    const won = s.word.split('').every(l=>guessed.includes(l)), lost = lives<=0
    await update(r, { guessed, lives, status:won?'won':lost?'lost':'playing' })
  }

  const newWord = async () => {
    if (!inRoom) return
    const w = GAME_WORDS[Math.floor(Math.random()*GAME_WORDS.length)]
    await set(ref(db, `games/${roomId}/word`), { word:w.word, hint:w.hint, guessed:[], lives:6, status:'playing' })
  }

  const rollDice = async () => {
    if (!inRoom) return
    setDiceRolling(true); setTimeout(()=>setDiceRolling(false), 500)
    const roll = Math.ceil(Math.random()*6)
    const myKey = myRole==='host'?'host':'guest'
    const snap = await get(ref(db, `games/${roomId}/dice`))
    const s = snap.val()||{scores:{host:0,guest:0},lastRoll:{}}
    const lastRoll = {...(s.lastRoll||{}), [myKey]:roll}
    const scores = {...(s.scores||{})}
    if (lastRoll.host && lastRoll.guest) {
      if(lastRoll.host>lastRoll.guest) scores.host=(scores.host||0)+1
      else if(lastRoll.guest>lastRoll.host) scores.guest=(scores.guest||0)+1
    }
    await update(ref(db, `games/${roomId}/dice`), { lastRoll, scores })
  }

  const resetDice = () => { if(inRoom) set(ref(db, `games/${roomId}/dice`), { scores:{host:0,guest:0}, lastRoll:null }) }

  const memFlipCard = async (pos) => {
    if (!inRoom || memStatus!=='playing' || memTurn!==myRole) return
    const r = ref(db, `games/${roomId}/memory`)
    const snap = await get(r)
    const s = snap.val()
    if (!s) return
    const f = s.flipped||[]
    if (f.includes(pos) || s.cards[pos].matched) return
    const newF = [...f, pos]
    const upd = {}; upd[`cards/${pos}/flipped`]=true; upd['flipped']=newF
    await update(r, upd)
    if (newF.length===2) {
      setTimeout(async () => {
        const snap2 = await get(r); const s2 = snap2.val()
        const [a,b] = s2.flipped
        const match = s2.cards[a].emoji===s2.cards[b].emoji
        const upd2 = {}
        upd2['flipped']=[]
        if (match) {
          upd2[`cards/${a}/matched`]=true; upd2[`cards/${b}/matched`]=true
          upd2[`cards/${a}/flipped`]=false; upd2[`cards/${b}/flipped`]=false
          upd2[`scores/${myRole}`]=(s2.scores?.[myRole]||0)+1
          const allDone = Object.values(s2.cards).filter(c=>c.pos!==a&&c.pos!==b).every(c=>c.matched)
          if (allDone) upd2['status']='done'
        } else {
          upd2[`cards/${a}/flipped`]=false; upd2[`cards/${b}/flipped`]=false
          upd2['turn']=myRole==='host'?'guest':'host'
        }
        await update(r, upd2)
      }, 900)
    }
  }

  const resetMemory = async () => {
    if (!inRoom) return
    const cards = [...MEM_EMOJIS,...MEM_EMOJIS].sort(()=>Math.random()-0.5).reduce((o,e,i)=>{o[i]={pos:i,emoji:e,flipped:false,matched:false};return o},{})
    await set(ref(db, `games/${roomId}/memory`), { cards, turn:'host', flipped:[], scores:{host:0,guest:0}, status:'playing' })
  }

  /* shelf stats */
  const shelveCounts = SHELVES.reduce((o,s)=>({...o,[s.key]:books.filter(b=>b.shelf===s.key).length}),{})

  /* progress */
  const pct = plannerStats.total>0 ? Math.round((plannerStats.done/plannerStats.total)*100) : 0

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      {/* Grain */}
      <div className={styles.grain} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.greetTag}>{slot.greeting}</div>
        <h1 className={styles.greetTitle}>{userName}'s <span dangerouslySetInnerHTML={{ __html: slot.title }} /></h1>
        <p className={styles.greetSub}>{slot.sub}</p>
        <div className={styles.dateLine}>
          <span>{now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
          <span className={styles.dot} />
          <span>{now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      </header>

      {/* Main Tabs */}
      <div className={styles.mainTabBar}>
        {MAIN_TABS.map(t=>(
          <button key={t.key} className={`${styles.mainTab} ${tab===t.key?styles.mainTabActive:''}`} onClick={()=>setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {tab==='overview' && (
        <div className={styles.grid}>
          {/* Coffee Card */}
          <div className={styles.cardCoffee} style={{background:slot.coffeeBg}}>
            <div className={styles.cardLabelLight}>{slot.coffeeLabel}</div>
            <span className={styles.coffeeIcon}>{slot.coffeeIcon}</span>
            <div className={styles.coffeeStatus} dangerouslySetInnerHTML={{__html:slot.coffeeStatus}} />
            <div className={styles.coffeeSub}>{slot.coffeeSub}</div>
          </div>

          {/* F1 Card */}
          <div className={styles.cardF1}>
            <div className={styles.cardLabel}>🏎 F1 Corner</div>
            <div className={styles.f1Team}>Scuderia Ferrari</div>
            <div className={styles.f1Sub}>Always and forever ❤️</div>
            <div className={styles.countdownRow}>
              {[{v:f1.days,l:'Days'},{v:f1.hours,l:'Hrs'},{v:f1.mins,l:'Min'}].map(({v,l})=>(
                <div key={l} className={styles.countBox}><span className={styles.countNum}>{v}</span><span className={styles.countLabel}>{l}</span></div>
              ))}
            </div>
            <span className={styles.f1Flag}>🏁</span>
          </div>

          {/* Mood Card */}
          <div className={styles.cardMood}>
            <div className={styles.cardLabel}>🌤 Daily Mood Generator</div>
            <div className={styles.moodDisplay} key={moodKey}>
              <div className={styles.moodText}>{mood}</div>
            </div>
            <button className={styles.btnAmber} onClick={genMood}>✦ Generate Kavya Mood</button>
          </div>

          {/* Music Card */}
          <div className={styles.cardMusic}>
            <div className={styles.musicHeader}>
              <div className={styles.cardLabelLight}>🎧 Music</div>
              <div className={styles.musicControls}>
                {playlists.length > 0 && !addingPlaylist && (
                  <select 
                    className={styles.playlistSelect} 
                    value={currentPlaylistId || ''} 
                    onChange={e => { setCurrentPlaylistId(e.target.value); setMusicPlaying(false); }}
                  >
                    {playlists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                {!addingPlaylist && <button className={styles.addPlaylistBtn} onClick={() => setAddingPlaylist(true)}>+</button>}
                {!addingPlaylist && currentPlaylistId && playlists.find(p=>p.id===currentPlaylistId)?.id !== 'default' && (
                  <button className={styles.addPlaylistBtn} onClick={() => deletePlaylist(currentPlaylistId)} style={{color:'#ef4444'}}>✕</button>
                )}
              </div>
            </div>

            {addingPlaylist && (
              <div className={styles.addPlaylistArea}>
                 <input className={styles.inputField} value={newPlaylistName} onChange={e=>setNewPlaylistName(e.target.value)} placeholder="Playlist Name (e.g. Focus Vibes)" />
                 <input className={styles.inputField} value={newPlaylistUrl} onChange={e=>setNewPlaylistUrl(e.target.value)} placeholder="Spotify Playlist URL" />
                 <div style={{display:'flex',gap:'8px'}}>
                    <button className={styles.btnAction} onClick={saveNewPlaylist}>Save</button>
                    <button className={styles.btnCancel} onClick={() => setAddingPlaylist(false)}>Cancel</button>
                 </div>
              </div>
            )}

            {!addingPlaylist && (
              <div className={styles.spotifyWrap}>
                {!musicPlaying && (
                  <div className={styles.playOverlay} onClick={startMusic}>
                    <div className={styles.playCircle}>
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div className={styles.playOverlayTitle}>{playlists.find(p=>p.id===currentPlaylistId)?.name || 'Play Music'}</div>
                    <div className={styles.playOverlaySub}>{lastPlayed?.playlistId === currentPlaylistId ? `Last played ${lastPlayed.playedAtLabel}` : "Click to start listening 🎧"}</div>
                  </div>
                )}
                {musicPlaying && currentPlaylistId && playlists.find(p=>p.id===currentPlaylistId) && (
                  <iframe src={playlists.find(p=>p.id===currentPlaylistId).url} width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Spotify Playlist" />
                )}
              </div>
            )}
          </div>

          {/* Book Card */}
          <div className={styles.cardBook}>
            <div className={styles.cardLabel}>📖 Reading Corner</div>
            <span className={styles.bookIcon}>📖</span>
            <div className={styles.bookQuote}>{bookQuote}</div>
            <div className={styles.bookSub}>Your daily reading reminder 🌿</div>
            <button className={styles.btnAmber} style={{marginTop:12}} onClick={()=>setTab('bookshelf')}>Browse Shelf →</button>
          </div>

          {/* Quote Card */}
          <div className={styles.cardQuote}>
            <div className={styles.cardLabel}>💬 Today's Thought</div>
            <div className={styles.bigQuote}>&ldquo;</div>
            <div className={styles.quoteText} style={{opacity:quoteVisible?1:0,transition:'opacity 0.22s'}}>{QUOTES[quoteIdx]}</div>
            <button className={styles.quoteRefreshBtn} onClick={refreshQuote}>↻ New thought</button>
          </div>

          {/* Weather Card */}
          <div className={styles.cardWeather}>
            <div className={styles.cardLabelLight}>🌦 Weather</div>
            <div className={styles.weatherIcon}>{weather?.icon ?? '⛅'}</div>
            <div className={styles.weatherTemp}>{weather ? `${weather.temp}°C` : '--°'}</div>
            <div className={styles.weatherDesc}>{weather?.desc ?? 'Loading...'}</div>
            <div className={styles.weatherCity}>{weather?.city ? `📍 ${weather.city}` : 'Fetching location...'}</div>
            {weather && (
              <div className={styles.weatherDetails}>
                <span>💧 {weather.humidity}%</span>
                <span>🌬 {weather.wind} km/h</span>
                <span>🌡 Feels {weather.feels}°C</span>
              </div>
            )}
          </div>

          {/* Note Card */}
          <div className={styles.cardNote}>
            <div className={styles.cardLabel}>💌 Leave a Note</div>
            <button className={styles.noteEditBtn} onClick={()=>setNoteEditing(e=>!e)}>✏️ Write</button>
            {note?.from && <div className={styles.noteFrom}>{note.from} 💛</div>}
            {!noteEditing && <div className={styles.noteDisplay}>{note?.text || <span className={styles.noteEmpty}>No note yet... leave a surprise message 💛</span>}</div>}
            {noteEditing && (
              <div className={styles.noteInputArea}>
                <textarea className={styles.noteTextarea} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Write something nice..." rows={3} />
                <div className={styles.noteActions}>
                  <button className={styles.noteSaveBtn} onClick={saveNote}>💛 Send Note</button>
                  <button className={styles.noteCancelBtn} onClick={()=>setNoteEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
            {note?.time && <div className={styles.noteMeta}>{note.time}</div>}
          </div>

          {/* Easter Egg */}
          <div className={styles.cardEaster} onClick={!easterRevealed?()=>setEasterRevealed(true):undefined} style={{cursor:easterRevealed?'default':'pointer'}}>
            {!easterRevealed && <div className={styles.easterHint}>✦ &nbsp; There might be a hidden message somewhere around here &nbsp; ✦</div>}
            {easterRevealed && (
              <div className={styles.easterReveal}>
                <div className={styles.easterBig}>Hello, {userName} 👋</div>
                <div className={styles.easterMsg}>This dashboard was built with good intentions and a little curiosity.<br/>Hope your day is as calm as a slow morning with a warm cup. ☕</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TO-DO LIST (JIRA BOARD) TAB ═══ */}
      {tab==='planner' && <SpaceBoard uid={uid} />}

      {/* ═══ BOOK SHELF TAB ═══ */}
      {tab==='bookshelf' && (
        <div className={styles.bookShelfSection}>
          <div className={styles.bookShelfHeader}>
            <div>
              <h2 className={styles.sectionTitle}>📚 Your Book Shelf</h2>
              <p className={styles.sectionSub}><strong>{books.length}</strong> {books.length===1?'book':'books'} tracked so far</p>
            </div>
            <Link to="/add" className={styles.btnAmber}>+ Add Book</Link>
          </div>
          <div className={styles.shelvesGrid}>
            {SHELVES.map(sh=>(
              <Link key={sh.key} to={`/shelf/${sh.key}`} className={styles.shelfCard} style={{'--shelf-c':sh.color,'--shelf-bg':sh.bg}}>
                <div className={styles.shelfCardIcon}>{sh.icon}</div>
                <div className={styles.shelfCardLabel}>{sh.label}</div>
                <div className={styles.shelfCardCount}>{shelveCounts[sh.key]} {shelveCounts[sh.key]===1?'book':'books'}</div>
                <div className={styles.shelfArrow}>→</div>
              </Link>
            ))}
          </div>
          {books.filter(b=>b.shelf==='reading').length>0 && (
            <section className={styles.bookSection}>
              <div className={styles.bookSectionHead}><h3>📖 Currently Reading</h3><Link to="/shelf/reading" className={styles.seeAll}>See all →</Link></div>
              <div className={styles.compactList}>{books.filter(b=>b.shelf==='reading').slice(0,3).map(b=><BookCard key={b.id} book={b} compact />)}</div>
            </section>
          )}
          {books.filter(b=>b.shelf==='done').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,3).length>0 && (
            <section className={styles.bookSection}>
              <div className={styles.bookSectionHead}><h3>✅ Recently Completed</h3><Link to="/shelf/done" className={styles.seeAll}>See all →</Link></div>
              <div className={styles.compactList}>{books.filter(b=>b.shelf==='done').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,3).map(b=><BookCard key={b.id} book={b} compact />)}</div>
            </section>
          )}

          <div style={{marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '20px'}}>
             <EpubLibrary />
          </div>
        </div>
      )}

      {/* ═══ GAMES TAB ═══ */}
      {tab==='games' && (
        <div className={styles.gamesSection}>
          <div className={styles.cardLabelLight} style={{color:'rgba(255,255,255,0.4)',marginBottom:4}}>🎮 Games Corner</div>
          <h2 className={styles.gamesTitle}>Play Together 🕹</h2>
          <p className={styles.gamesSub}>Real-time multiplayer — both open on any device</p>

          {/* Room Setup */}
          <div className={styles.roomSetup}>
            <input className={styles.roomInput} value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder={`Room name (e.g. ${userName.toLowerCase()}123)`} maxLength={20} />
            <input className={styles.roomInput} value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Your name" maxLength={12} style={{maxWidth:140}} />
            <button className={styles.btnAmber} onClick={joinRoom}>Join Room</button>
            <div className={`${styles.roomStatus} ${inRoom?styles.roomStatusOnline:''}`}>{roomStatus}</div>
          </div>

          {/* Game Tabs */}
          <div className={styles.gameTabs}>
            {[{k:'ttt',l:'⭕ Tic Tac Toe'},{k:'word',l:'📝 Word Guess'},{k:'memory',l:'🃏 Memory'},{k:'dice',l:'🎲 Dice Battle'}].map(({k,l})=>(
              <button key={k} className={`${styles.gameTab} ${gameTab===k?styles.gameTabActive:''}`} onClick={()=>setGameTab(k)}>{l}</button>
            ))}
          </div>

          {/* TTT */}
          {gameTab==='ttt' && (
            <div className={styles.tttWrapper}>
              <div className={styles.tttStatus}>{tttWinner?`${tttWinner==='X'?'❌':'⭕'} Wins! 🎉`:tttDraw?"It's a draw! 🤝":!inRoom?'Join a room to play':tttTurn===(myRole==='host'?'X':'O')?'Your turn!':'Opponent\'s turn...'}</div>
              <div className={styles.tttBoard}>
                {tttBoard.map((v,i)=>(
                  <div key={i} className={`${styles.tttCell} ${v?styles.tttTaken:''} ${v==='X'?styles.tttX:v==='O'?styles.tttO:''}`} onClick={()=>tttMove(i)}>
                    {v==='X'?'❌':v==='O'?'⭕':''}
                  </div>
                ))}
              </div>
              <div className={styles.tttScore}>❌ {tttScores.X||0} — ⭕ {tttScores.O||0}</div>
              <button className={styles.btnGhost} onClick={resetTTT}>↺ New Game</button>
            </div>
          )}

          {/* Word Guess */}
          {gameTab==='word' && wordState && (
            <div className={styles.wordWrapper}>
              <div className={styles.wordStatus}>{wordState.status==='won'?`🎉 Found: ${wordState.word}!`:wordState.status==='lost'?`💀 Out of lives! Word: ${wordState.word}`:!inRoom?'Join a room to play':'Guess the word!'}</div>
              <div className={styles.wordHint}>Hint: {wordState.hint}</div>
              <div className={styles.wordDisplay}>
                {(wordState.word||'').split('').map((l,i)=>(
                  <div key={i} className={`${styles.letterBox} ${(wordState.guessed||[]).includes(l)?styles.letterRevealed:''}`}>{(wordState.guessed||[]).includes(l)?l:''}</div>
                ))}
              </div>
              <div className={styles.wordLives}>{'❤️'.repeat(wordState.lives||0)}{'🖤'.repeat(6-(wordState.lives||0))}</div>
              <div className={styles.guessedLetters}>{(wordState.guessed||[]).join(' ')}</div>
              <div className={styles.wordInputRow}>
                <input className={styles.letterInput} value={letterInput} onChange={e=>setLetterInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&guessLetter()} maxLength={1} placeholder="A" />
                <button className={styles.btnAmber} onClick={guessLetter}>Guess</button>
              </div>
              <button className={styles.btnGhost} onClick={newWord}>↺ New Word</button>
            </div>
          )}
          {gameTab==='word' && !wordState && <div className={styles.gamePrompt}>Join a room to play!</div>}

          {/* Memory */}
          {gameTab==='memory' && (
            <div className={styles.memoryWrapper}>
              <div className={styles.memTurn}>{!inRoom?'Join a room to play':memStatus==='done'?`🎉 Game Over! You: ${memScores[myRole||'host']} — Opponent: ${memScores[myRole==='host'?'guest':'host']}`:memTurn===myRole?'Your turn — flip a card!':"Opponent's turn..."}</div>
              <div className={styles.memScores}>
                <span className={styles.memScore}>You: {memScores[myRole||'host']||0}</span>
                <span className={styles.memScore}>Opponent: {memScores[myRole==='host'?'guest':'host']||0}</span>
              </div>
              <div className={styles.memBoard}>
                {memCards.map(c=>(
                  <div key={c.pos} className={`${styles.memCard} ${c.flipped||c.matched?styles.memFlipped:''} ${c.matched?styles.memMatched:''}`} onClick={()=>memFlipCard(c.pos)}>
                    <div className={styles.memFront}>?</div>
                    <div className={styles.memBack}>{c.emoji}</div>
                  </div>
                ))}
              </div>
              <button className={styles.btnGhost} onClick={resetMemory}>↺ New Game</button>
            </div>
          )}

          {/* Dice */}
          {gameTab==='dice' && (
            <div className={styles.diceWrapper}>
              <div className={styles.diceResult}>
                {!inRoom?'Join a room and roll! 🎲':
                  diceState.lastRoll?.host && diceState.lastRoll?.guest
                    ? diceState.lastRoll[myRole==='host'?'host':'guest'] > diceState.lastRoll[myRole==='host'?'guest':'host'] ? '🎉 You win this round!'
                      : diceState.lastRoll[myRole==='host'?'host':'guest'] < diceState.lastRoll[myRole==='host'?'guest':'host'] ? '😅 Opponent wins!'
                      : "🤝 It's a tie!"
                    : 'Roll your dice!'}
              </div>
              <div className={styles.diceDisplay}>
                <div className={styles.dicePlayer}>
                  <div className={styles.diceName}>{playerName||'You'}</div>
                  <div className={`${styles.diceFace} ${diceRolling?styles.diceRolling:''}`}>{diceState.lastRoll?.[myRole==='host'?'host':'guest'] ? DICE_FACES[(diceState.lastRoll[myRole==='host'?'host':'guest']||1)-1] : '🎲'}</div>
                  <div className={styles.diceScore}>Wins: <strong>{diceState.scores?.[myRole==='host'?'host':'guest']||0}</strong></div>
                </div>
                <div className={styles.vsLabel}>VS</div>
                <div className={styles.dicePlayer}>
                  <div className={styles.diceName}>Opponent</div>
                  <div className={styles.diceFace}>{diceState.lastRoll?.[myRole==='host'?'guest':'host'] ? DICE_FACES[(diceState.lastRoll[myRole==='host'?'guest':'host']||1)-1] : '🎲'}</div>
                  <div className={styles.diceScore}>Wins: <strong>{diceState.scores?.[myRole==='host'?'guest':'host']||0}</strong></div>
                </div>
              </div>
              <div className={styles.gameControls}>
                <button className={styles.btnAmber} onClick={rollDice}>🎲 Roll!</button>
                <button className={styles.btnGhost} onClick={resetDice}>↺ Reset Score</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
