import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initializeApp } from './fmodLogic'

;(async () => {
  try {
    await initializeApp()
    const root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(<App />)
  } catch (error) {
    console.error('Initialization failed:', error)
  }
})()
