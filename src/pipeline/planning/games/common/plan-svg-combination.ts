import type * as types from '../../../types'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import ArbitraryStep from '../../../steps/actions/arbitrary-step'
import DeleteFromKeyValueStoreIfSetStep from '../../../steps/actions/stores/delete-from-key-value-store-if-set-step'
import gameSvgDefStore from '../../../stores/game-svg-def-store'
import gameSvgDefCombinationStore from '../../../stores/game-svg-def-combination-store'

function getOrderedTypeScriptNames (game: string): readonly string[] {
  return Object
    .keys(gameSvgDefStore.tryGetAllByBaseKey(game))
    .sort()
}

export default function (
  svgDiff: Diff<types.GameSrcFile>
): StepBase {
  const gameDiff = svgDiff
    .mapItems(item => item.game)
    .deduplicateItems()

  return gameDiff.generateSteps(
    'svgCombination',
    false,
    item => item,
    item => [
      new DeleteFromKeyValueStoreIfSetStep(gameSvgDefCombinationStore, item)
    ],
    item => [
      new ArbitraryStep(
        'generateSvg',
        async () => {
          const defs = getOrderedTypeScriptNames(item)
            .map((name, index) => {
              const def = gameSvgDefStore.get(item, name)

              const matches = def.match(/(\s)id=""/g)

              if (matches === null || matches.length !== 1) {
                throw new Error(`Failed to inject ID into SVG def "${name}".`)
              }

              return def.replace(/\sid=""/, `${matches[0].slice(0, matches[0].length - 5)}id="${index}"`)
            })
            .join('')

          gameSvgDefCombinationStore.set(item, defs)
        }
      )
    ]
  )
}
