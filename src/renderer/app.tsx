import { Outlet } from 'react-router-dom'

export function App() {
  return (
    <div className="h-screen flex flex-col bg-app-bg-primary text-app-text-primary">
      <div className="h-8 flex-shrink-0 app-drag bg-app-bg-secondary border-b border-app-border">
        <div className="flex items-center justify-center h-full text-xs text-app-text-muted">
          Snippet Manager
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
