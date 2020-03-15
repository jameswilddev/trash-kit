const version = 0

type State = {
  lifting: null | {
    readonly piece: number
    readonly fromTower: number
  }
  readonly towers: ReadonlyArray<number[]>
}

function initial(): State {
  return {
    lifting: null,
    towers: [[0, 1, 2, 3, 4], [], []]
  }
}

const fullWidthVirtualPixels = safeAreaWidthVirtualPixels * 2
const fullHeightVirtualPixels = safeAreaHeightVirtualPixels * 2
const halfSafeAreaWidthVirtualPixels = safeAreaWidthVirtualPixels / 2
const halfSafeAreaHeightVirtualPixels = safeAreaHeightVirtualPixels / 2
const towerWidthVirtualPixels = safeAreaWidthVirtualPixels / 3
const halfTowerWidthVirtualPixels = towerWidthVirtualPixels / 2
const pieceHeightVirtualPixels = 20

const pieces = [piece0_svg, piece1_svg, piece2_svg, piece3_svg, piece4_svg]

function render(): void {
}
