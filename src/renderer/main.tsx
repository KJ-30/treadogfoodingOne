import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { App } from './app'
import { MainPage } from './pages/main-page'
import { SearchPage } from './pages/search-page'
import { SettingsPage } from './pages/settings-page'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<MainPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
