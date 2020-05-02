const version = 1

type State = {
  piece: number
  fromTower: number
  lifted: boolean
  readonly towers: ReadonlyArray<number[]>
}

function initial(): State {
  return {
    piece: 4,
    fromTower: 0,
    lifted: false,
    towers: [[0, 1, 2, 3, 4], [], []]
  }
}

const towerWidthVirtualPixels = safeAreaWidthVirtualPixels / 3
const pieceHeightVirtualPixels = 20

const pieces = [piece0_svg, piece1_svg, piece2_svg, piece3_svg, piece4_svg]

function render(): void {
  sprite(root, background_svg)

  const won = state.towers[2].length === 5

  let x = 0
  for (let i = 0; i < 3; i++) {
    const tower = state.towers[i]
    let y = 0

    for (const piece of tower) {
      const pieceSprite = sprite(root, pieces[piece])

      if (piece === state.piece) {
        transform(pieceSprite, [translate(state.fromTower * towerWidthVirtualPixels, -100)])
        easeIn(pieceSprite, 0.125)
      }

      transform(pieceSprite, [translate(x, y)])

      y -= pieceHeightVirtualPixels
    }

    if (state.fromTower === i && state.lifted) {
      const pieceSprite = sprite(root, pieces[state.piece])
      transform(pieceSprite, [translate(x, y)])
      easeOut(pieceSprite, 0.125)
      transform(pieceSprite, [translate(x, -100)])
    }

    const iCopy = i

    if (!won) {
      if (state.lifted) {
        if (!tower.length || tower[tower.length - 1] < state.piece) {
          const hitbox = rectangle(root, towerWidthVirtualPixels, safeAreaHeightVirtualPixels)
          transform(hitbox, [translate(x, 0)])
          click(hitbox, () => {
            state.lifted = false
            tower.push(state.piece)
          })
        }
      } else {
        if (tower.length) {
          const hitbox = rectangle(root, towerWidthVirtualPixels, safeAreaHeightVirtualPixels)
          transform(hitbox, [translate(x, 0)])
          click(hitbox, () => {
            state.fromTower = iCopy
            state.piece = tower[tower.length - 1]
            state.lifted = true
            tower.length--
          })
        }
      }
    }

    x += towerWidthVirtualPixels
  }

  if (won) {
    sprite(root, win_svg)
  }

  const resetHitbox = rectangle(root, 32, 32)
  transform(resetHitbox, [translate(safeAreaWidthVirtualPixels / 2 - 16, 10)])
  click(resetHitbox, () => {
    state = initial()
  })
}
