import type * as types from '../../../types'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import ArbitraryStep from '../../../steps/actions/arbitrary-step'
import DeleteFromKeyPairValueStoreIfSetStep from '../../../steps/actions/stores/delete-from-key-pair-value-store-if-set-step'
import ReadTextFileStep from '../../../steps/actions/files/read-text-file-step'
import OptimizeSvgStep from '../../../steps/actions/optimize-svg-step'
import gameSvgTextStore from '../../../stores/game-svg-text-store'
import gameSvgOptimizedStore from '../../../stores/game-svg-optimized-store'
import gameSvgDefStore from '../../../stores/game-svg-def-store'

// @ts-expect-error TODO: TypeScript unable to find d.ts file.
import * as parser from 'svgo/lib/parser'

// @ts-expect-error TODO: TypeScript unable to find d.ts file.
import * as stringifier from 'svgo/lib/stringifier'

export default function (
  svgDiff: Diff<types.GameSrcFile>
): StepBase {
  return svgDiff.generateSteps(
    'svg',
    false,
    item => item.name,
    item => [
      new DeleteFromKeyPairValueStoreIfSetStep(
        gameSvgTextStore, item.game, item.name
      ),
      new DeleteFromKeyPairValueStoreIfSetStep(
        gameSvgOptimizedStore, item.game, item.name
      ),
      new DeleteFromKeyPairValueStoreIfSetStep(
        gameSvgDefStore, item.game, item.name
      )
    ],
    item => [
      new ReadTextFileStep(
        item.path,
        text => { gameSvgTextStore.set(item.game, item.name, text) }
      ),
      new OptimizeSvgStep(
        () => gameSvgTextStore.get(item.game, item.name),
        optimized => {
          gameSvgOptimizedStore.set(
            item.game, item.name, optimized
          )
        }
      ),
      new ArbitraryStep(
        'convertSvgDocumentToDef',
        async () => {
          const text = gameSvgOptimizedStore.get(item.game, item.name)

          const root = parser.parseSvg(text)

          const children = root.children[0].children

          if (children.length === 1) {
            // Remove the wrapping <svg> (there's already a single root).
            root.children = children
          } else {
            // Replace the wrapping <svg> with a <g>.
            const groupSource = parser.parseSvg('<svg><g></g></svg>')

            root.children = groupSource.children[0].children
            groupSource.children[0].children[0].children = children
          }

          // Inject a blank ID.  This should be safely replaceable later down
          // the line, as we've already filtered out IDs using SVGO.
          const idSource = parser.parseSvg('<svg id="" />')

          root.children[0].attributes.id = idSource.children[0].attributes.id

          const generated = stringifier.stringifySvg(root)
          gameSvgDefStore.set(item.game, item.name, generated)
        }
      )
    ]
  )
}
