import React from 'react'
import { Minus, Square, X } from 'lucide-react'

function TitleBar() {
  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow()
  }

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow()
  }

  const handleClose = () => {
    window.electronAPI?.closeWindow()
  }

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>代码片段管理器</span>
      </div>
      <div className="title-bar-right">
        <button className="title-bar-button" onClick={handleMinimize}>
          <Minus size={14} />
        </button>
        <button className="title-bar-button" onClick={handleMaximize}>
          <Square size={14} />
        </button>
        <button className="title-bar-button close" onClick={handleClose}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export default TitleBar
