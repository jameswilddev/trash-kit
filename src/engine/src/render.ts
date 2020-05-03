function engineRender(): void {
  engineDebugger()

  root = document.getElementsByTagName(`svg`)[0]

  while (true) {
    const last = root.lastChild as Element

    if (last.tagName === `defs`) {
      break
    }

    root.removeChild(last)
  }

  render()
}

function engineGroup(
  parent: Parent,
): Group {
  const element = document.createElementNS(`http://www.w3.org/2000/svg`, `g`)
  parent.appendChild(element)
  return element
}

function engineSprite(
  parent: Parent,
  svg: AnySvg,
): Sprite {
  const element = document.createElementNS(`http://www.w3.org/2000/svg`, `use`)
  element.setAttributeNS(`http://www.w3.org/1999/xlink`, `href`, `#${svg}`)
  parent.appendChild(element)
  return element
}

function engineRectangle(
  parent: Parent,
  widthVirtualPixels: number,
  heightVirtualPixels: number,
  fill?: string
): Rectangle {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  element.setAttribute('width', `${widthVirtualPixels}px`)
  element.setAttribute('height', `${heightVirtualPixels}px`)
  element.setAttribute('fill', fill || `#0000`)
  parent.appendChild(element)
  return element
}

function engineClick(
  child: ClickableChild,
  then: () => void,
): void {
  child.onmousedown = handler
  child.ontouchstart = handler

  function handler(
    e: Event
  ): void {
    e.preventDefault()
    then()
    engineRender()
  }
}
