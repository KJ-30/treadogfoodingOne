import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import QuickSearch from './components/QuickSearch'
import './index.css'

declare global {
  interface Window {
    electronAPI: {
      getPlatform: () => Promise<string>
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      hideQuickSearch: () => Promise<void>
      copyToClipboard: (text: string) => Promise<void>
      onQuickSearchOpen: (callback: () => void) => () => void
    }
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/quick-search" element={<QuickSearch />} />
      </Routes>
    </Router>
  </React.StrictMode>
)
