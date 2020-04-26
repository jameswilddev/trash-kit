declare const engineDebug: boolean
declare const engineUuid: string
declare const gameName: string

declare const safeAreaWidthVirtualPixels: number
declare const safeAreaHeightVirtualPixels: number

type State = `STATE PLACEHOLDER`
type AnySvg = `ANY SVG PLACEHOLDER`

declare function initial(): State

declare const version: number

declare function render(): undefined | (() => void)
