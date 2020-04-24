const svg2js = require("svgo/lib/svgo/svg2js")
const JS2SVG = require("svgo/lib/svgo/js2svg")
import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import ArbitraryStep from "../../steps/actions/arbitrary-step"
import DeleteFromKeyPairValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-pair-value-store-if-set-step"
import ReadTextFileStep from "../../steps/actions/files/read-text-file-step"
import OptimizeSvgStep from "../../steps/actions/optimize-svg-step"
import gameSvgTextStore from "../../stores/game-svg-text-store"
import gameSvgOptimizedStore from "../../stores/game-svg-optimized-store"
import gameSvgDefStore from "../../stores/game-svg-def-store"

export default function (
  svgDiff: Diff<types.GameSrcFile>
): StepBase {
  return svgDiff.generateSteps(
    `svg`,
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
      ),
    ],
    item => [
      new ReadTextFileStep(
        item.path,
        text => gameSvgTextStore.set(item.game, item.name, text)
      ),
      new OptimizeSvgStep(
        () => gameSvgTextStore.get(item.game, item.name),
        optimized => gameSvgOptimizedStore.set(
          item.game, item.name, optimized
        )
      ),
      new ArbitraryStep(
        `convertSvgDocumentToDef`,
        async () => {
          const text = gameSvgOptimizedStore.get(item.game, item.name)

          const root = await new Promise<any>(resolve => svg2js(text, resolve))

          const children = root.content[0].content

          if (children.length === 1) {
            // Remove the wrapping <svg> (there's already a single root).
            root.content = children
          } else {
            // Replace the wrapping <svg> with a <g>.
            const groupSource = await new Promise<any>(resolve => svg2js(`<svg><g></g></svg>`, resolve))
            root.content = groupSource.content[0].content
            groupSource.content[0].content[0].content = children
          }

          // Inject a blank ID.  This should be safely replaceable later down
          // the line, as we've already filtered out IDs using SVGO.
          const idSource = await new Promise<any>(resolve => svg2js(`<svg id="" />`, resolve))
          root.content[0].attrs.id = idSource.content[0].attrs.id

          const generated = new JS2SVG(root).data
          gameSvgDefStore.set(item.game, item.name, generated)
        }
      ),
    ]
  )
}
