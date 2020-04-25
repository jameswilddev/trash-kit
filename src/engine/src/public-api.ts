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
