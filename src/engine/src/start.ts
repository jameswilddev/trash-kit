onload = () => {
  engineStorageCheck()
  engineStateLoad()
  engineRender()
  onunload = engineStateSave
  onresize = engineViewportsResize
}
