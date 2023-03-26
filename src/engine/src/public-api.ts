// eslint-disable-line no-unused-vars
let state: State

// eslint-disable-line no-unused-vars
type Falsy = false | 0 | null | ''

// eslint-disable-line no-unused-vars
type Truthiness = 1 | undefined

// eslint-disable-line no-unused-vars
type Json = EngineJson

// eslint-disable-line no-unused-vars
function linearInterpolate (
  from: number,
  to: number,
  mixUnitInterval: number
): number {
  return from + (to - from) * mixUnitInterval
}

// eslint-disable-line no-unused-vars
function dotProduct (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return x1 * x2 + y1 * y2
}

// eslint-disable-line no-unused-vars
function magnitudeSquared (
  x: number,
  y: number
): number {
  return dotProduct(x, y, x, y)
}

// eslint-disable-line no-unused-vars
function magnitude (
  x: number,
  y: number
): number {
  return Math.sqrt(magnitudeSquared(x, y))
}

// eslint-disable-line no-unused-vars
function distanceSquared (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return magnitudeSquared(x2 - x1, y2 - y1)
}

// eslint-disable-line no-unused-vars
function distance (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return magnitude(x2 - x1, y2 - y1)
}

// eslint-disable-line no-unused-vars
type Transform = string

// eslint-disable-line no-unused-vars
function translate (
  xVirtualPixels: number,
  yVirtualPixels: number
): Transform {
  return `translate(${xVirtualPixels}px,${yVirtualPixels}px)`
}

// eslint-disable-line no-unused-vars
function rotate (
  degreesClockwise: number
): Transform {
  return `rotate(${degreesClockwise}deg)`
}

// eslint-disable-line no-unused-vars
function scale (
  xFactor: number,
  yFactor: number
): Transform {
  return `scale(${xFactor},${yFactor})`
}

// eslint-disable-line no-unused-vars
function scaleUniform (
  factor: number
): Transform {
  return `scale(${factor})`
}

// eslint-disable-line no-unused-vars
type Filter = string

// eslint-disable-line no-unused-vars
function soften (
  virtualPixels: number
): Filter {
  return `blur(${virtualPixels}px)`
}

// eslint-disable-line no-unused-vars
function brightness (
  factor: number
): Filter {
  return `brightness(${factor})`
}

// eslint-disable-line no-unused-vars
function contrast (
  factor: number
): Filter {
  return `contrast(${factor})`
}

// eslint-disable-line no-unused-vars
function sharpDropShadow (
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

// eslint-disable-line no-unused-vars
function softDropShadow (
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

// eslint-disable-line no-unused-vars
function grayscale (
  factor: number
): Filter {
  return `grayscale(${factor})`
}

// eslint-disable-line no-unused-vars
function hueRotate (
  degrees: number
): Filter {
  return `hue-rotate(${degrees}deg)`
}

// eslint-disable-line no-unused-vars
function invert (
  factor: number
): Filter {
  return `invert(${factor})`
}

// eslint-disable-line no-unused-vars
function opacity (
  factor: number
): Filter {
  return `opacity(${factor})`
}

// eslint-disable-line no-unused-vars
function saturate (
  factor: number
): Filter {
  return `saturate(${factor})`
}

// eslint-disable-line no-unused-vars
function sepia (
  factor: number
): Filter {
  return `sepia(${factor})`
}

// eslint-disable-line no-unused-vars
function saveLoadAvailable (): Truthiness {
  try {
    localStorage.setItem(`${gameName}-check`, 'check')
    return 1
  } catch { }
}

// eslint-disable-line no-unused-vars
function save<T extends EngineJson> (name: string, content: T): Truthiness {
  return engineStorageSave(`custom-${name}`, content)
}

// eslint-disable-line no-unused-vars
function load<T extends EngineJson> (name: string): null | T {
  return engineStorageLoad(`custom-${name}`)
}

// eslint-disable-line no-unused-vars
function drop (name: string): Truthiness {
  return engineStorageDrop(`custom-${name}`)
}

// eslint-disable-line no-unused-vars
let root: SVGSVGElement

// eslint-disable-line no-unused-vars
type Group = SVGGElement

// eslint-disable-line no-unused-vars
type Sprite = SVGUseElement

// eslint-disable-line no-unused-vars
type Rectangle = SVGRectElement

// eslint-disable-line no-unused-vars
type TextObject = SVGTextElement

// eslint-disable-line no-unused-vars
type Parent = SVGSVGElement | Group

// eslint-disable-line no-unused-vars
type TransformableChild = Group | Sprite | Rectangle | TextObject

// eslint-disable-line no-unused-vars
type FilterableChild = Group | Sprite | Rectangle | TextObject

// eslint-disable-line no-unused-vars
type TransformableOrFilterableChild = TransformableChild | FilterableChild

// eslint-disable-line no-unused-vars
type ClickableChild = Group | Sprite | Rectangle | TextObject

// eslint-disable-line no-unused-vars
function group (
  parent: Parent
): Group {
  return engineGroup(parent)
}

// eslint-disable-line no-unused-vars
function sprite (
  parent: Parent,
  svg: AnySvg
): Sprite {
  return engineSprite(parent, svg)
}

// eslint-disable-line no-unused-vars
function rectangle (
  parent: Parent,
  widthVirtualPixels: number,
  heightVirtualPixels: number,
  fill?: string
): Rectangle {
  return engineRectangle(parent, widthVirtualPixels, heightVirtualPixels, fill)
}

// eslint-disable-line no-unused-vars
type TextAnchor = Falsy | 'middle' | 'end'

// eslint-disable-line no-unused-vars
type DominantBaseline = Falsy | 'middle' | 'hanging'

// eslint-disable-line no-unused-vars
function text (
  parent: Parent,
  textContent: string,
  fontFamily?: Falsy | string,
  color?: Falsy | string,
  textAnchor?: TextAnchor,
  dominantBaseline?: DominantBaseline
): TextObject {
  return engineText(parent, textContent, fontFamily, color, textAnchor, dominantBaseline)
}

// eslint-disable-line no-unused-vars
function transform (
  child: TransformableChild,
  transforms: readonly Transform[]
): void {
  engineApplyTransformOrFilter(child, 'transform', transforms)
}

// eslint-disable-line no-unused-vars
function filter (
  child: FilterableChild,
  filters: readonly Filter[]
): void {
  engineApplyTransformOrFilter(child, 'filter', filters)
}

// eslint-disable-line no-unused-vars
function delay (
  child: TransformableOrFilterableChild,
  durationSeconds: number
): void {
  engineSetTransition(child, 'jump-end', durationSeconds)
}

// eslint-disable-line no-unused-vars
function linear (
  child: TransformableOrFilterableChild,
  durationSeconds: number
): void {
  engineSetTransition(child, 'linear', durationSeconds)
}

// eslint-disable-line no-unused-vars
function easeOut (
  child: TransformableOrFilterableChild,
  durationSeconds: number
): void {
  engineSetTransition(child, 'ease-out', durationSeconds)
}

// eslint-disable-line no-unused-vars
function easeIn (
  child: TransformableOrFilterableChild,
  durationSeconds: number
): void {
  engineSetTransition(child, 'ease-in', durationSeconds)
}

// eslint-disable-line no-unused-vars
function easeInOut (
  child: TransformableOrFilterableChild,
  durationSeconds: number
): void {
  engineSetTransition(child, 'ease-in-out', durationSeconds)
}

// eslint-disable-line no-unused-vars
function ease (
  child: TransformableOrFilterableChild,
  durationSeconds: number
): void {
  engineSetTransition(child, 'ease', durationSeconds)
}

// eslint-disable-line no-unused-vars
function click (
  child: ClickableChild,
  then: () => void
): void {
  engineClick(child, then)
}
