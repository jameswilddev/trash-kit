let engineDebuggerElement: HTMLPreElement

function engineDebugger (): void {
  if (engineDebug) {
    if (!engineDebuggerElement) {
      engineDebuggerElement = document.createElement('pre')
      engineDebuggerElement.style.position = 'fixed'
      engineDebuggerElement.style.right = '0'
      engineDebuggerElement.style.bottom = '0'
      engineDebuggerElement.style.color = '#fff'
      engineDebuggerElement.style.fontSize = '0.25cm'
      engineDebuggerElement.style.textShadow = '0 0.03125cm 0.0625cm #000, 0 0.03125cm 0.0625cm #000, 0 0.03125cm 0.0625cm #000'
      document.body.appendChild(engineDebuggerElement)
    }

    engineDebuggerElement.textContent = JSON.stringify(state, null, 2)
  }
}
