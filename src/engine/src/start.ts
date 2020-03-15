onload = () => {
  engineStorageCheck()
  engineStateLoad()
  engineRender()
  onunload = engineStateSave
  onkeydown = engineKeyInputHandleKey
  onresize = engineViewportsResize
}
