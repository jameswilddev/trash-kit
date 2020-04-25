let state: State

type Truthiness = 1 | undefined

type Json = EngineJson

function linearInterpolate(
  from: number,
  to: number,
  mixUnitInterval: number
): number {
  return from + (to - from) * mixUnitInterval
}

function dotProduct(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return x1 * x2 + y1 * y2
}

function magnitudeSquared(
  x: number,
  y: number
): number {
  return dotProduct(x, y, x, y)
}

function magnitude(
  x: number,
  y: number
): number {
  return Math.sqrt(magnitudeSquared(x, y))
}

function distanceSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return magnitudeSquared(x2 - x1, y2 - y1)
}

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return magnitude(x2 - x1, y2 - y1)
}

type Transform = string

function translateX(
  virtualPixels: number,
): Transform {
  return `translateX(${virtualPixels}px)`
}

function translateY(
  virtualPixels: number,
): Transform {
  return `translateY(${virtualPixels}px)`
}

function translate(
  xVirtualPixels: number,
  yVirtualPixels: number,
): Transform {
  return `translate(${xVirtualPixels}px,${yVirtualPixels}px)`
}

function rotate(
  degreesClockwise: number,
): Transform {
  return `rotate(${degreesClockwise}deg)`
}

function scaleX(
  factor: number,
): Transform {
  return `scaleX(${factor})`
}

function scaleY(
  factor: number,
): Transform {
  return `scaleY(${factor})`
}

function scale(
  xFactor: number,
  yFactor: number,
): Transform {
  return `scale(${xFactor},${yFactor})`
}

function scaleUniform(
  factor: number,
): Transform {
  return `scale(${factor})`
}

type Filter = string

function soften(
  virtualPixels: number
): Filter {
  return `blur(${virtualPixels}px)`
}

function brightness(
  factor: number
): Filter {
  return `brightness(${factor})`
}

function contrast(
  factor: number
): Filter {
  return `contrast(${factor})`
}

function sharpDropShadow(
  offsetXVirtualPixels: number,
  offsetYVirtualPixels: number,
  color?: string
): Filter {
  let output = `drop-shadow(${offsetXVirtualPixels}px ${offsetYVirtualPixels}px`

  if (color) {
    output += ` #${color}`
  }

  return `${output})`
}

function softDropShadow(
  offsetXVirtualPixels: number,
  offsetYVirtualPixels: number,
  radiusVirtualPixels: number,
  color?: string
): Filter {
  let output = `drop-shadow(${offsetXVirtualPixels}px ${offsetYVirtualPixels}px ${radiusVirtualPixels}px`

  if (color) {
    output += ` #${color}`
  }

  return `${output})`
}

function grayscale(
  factor: number
): Filter {
  return `grayscale(${factor})`
}

function hueRotate(
  degrees: number
): Filter {
  return `hue-rotate(${degrees}deg)`
}

function invert(
  factor: number
): Filter {
  return `invert(${factor})`
}

function opacity(
  factor: number
): Filter {
  return `opacity(${factor})`
}

function saturate(
  factor: number
): Filter {
  return `saturate(${factor})`
}

function sepia(
  factor: number
): Filter {
  return `sepia(${factor})`
}

function saveLoadAvailable(): Truthiness {
  try {
    localStorage.setItem(`${gameName}-check`, `check`)
    return 1
  } catch { }
  return
}

function save<T extends EngineJson>(name: string, content: T): Truthiness {
  return engineStorageSave(`custom-${name}`, content)
}

function load<T extends EngineJson>(name: string): null | T {
  return engineStorageLoad(`custom-${name}`)
}

function drop(name: string): Truthiness {
  return engineStorageDrop(`custom-${name}`)
}
