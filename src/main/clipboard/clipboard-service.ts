export class ClipboardService {
  private defaultVariables: Record<string, () => string> = {
    date: () => new Date().toLocaleDateString(),
    time: () => new Date().toLocaleTimeString(),
    datetime: () => new Date().toLocaleString(),
    timestamp: () => Date.now().toString(),
    year: () => new Date().getFullYear().toString(),
    month: () => (new Date().getMonth() + 1).toString().padStart(2, '0'),
    day: () => new Date().getDate().toString().padStart(2, '0'),
    hour: () => new Date().getHours().toString().padStart(2, '0'),
    minute: () => new Date().getMinutes().toString().padStart(2, '0'),
    second: () => new Date().getSeconds().toString().padStart(2, '0'),
  }

  replaceVariables(text: string, customVariables: Record<string, string> = {}): string {
    return text.replace(/\{\{(\w+)\}\}/gi, (match, varName) => {
      const lowerVarName = varName.toLowerCase()
      
      if (customVariables[lowerVarName] !== undefined) {
        return customVariables[lowerVarName]
      }
      
      if (this.defaultVariables[lowerVarName]) {
        return this.defaultVariables[lowerVarName]()
      }
      
      return match
    })
  }
}
