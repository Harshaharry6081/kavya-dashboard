import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyA6X4vizsAdynQRGAIE-u-WX3gB3tI9V-U",
  authDomain: "kavya-dashboard-143.firebaseapp.com",
  databaseURL: "https://kavya-dashboard-143-default-rtdb.firebaseio.com",
  projectId: "kavya-dashboard-143",
  storageBucket: "kavya-dashboard-143.firebasestorage.app",
  messagingSenderId: "742321607167",
  appId: "1:742321607167:web:34c2ea73ff43e983cad7ca"
}

const app = getApps().find(a => a.name === 'books') || 
            initializeApp(firebaseConfig, 'books')

export const db = getDatabase(app)
