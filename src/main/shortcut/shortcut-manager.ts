import { BrowserWindow, globalShortcut, screen } from 'electron'

export class ShortcutManager {
  private mainWindow: BrowserWindow
  private searchWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow, searchWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.searchWindow = searchWindow
  }

  registerGlobalShortcut(): boolean {
    const accelerator = process.platform === 'darwin' 
      ? 'Command+Shift+Space' 
      : 'Ctrl+Shift+Space'

    const success = globalShortcut.register(accelerator, () => {
      this.toggleSearchWindow()
    })

    if (!success) {
      console.error('Failed to register global shortcut:', accelerator)
    }

    return success
  }

  private toggleSearchWindow() {
    if (this.searchWindow.isVisible()) {
      this.searchWindow.hide()
    } else {
      this.positionSearchWindow()
      this.searchWindow.show()
      this.searchWindow.focus()
    }
  }

  private positionSearchWindow() {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    const windowWidth = 600
    const windowHeight = 450

    this.searchWindow.setBounds({
      x: Math.round((width - windowWidth) / 2),
      y: Math.round((height - windowHeight) / 3),
      width: windowWidth,
      height: windowHeight,
    })
  }

  unregisterAll() {
    globalShortcut.unregisterAll()
  }
}
