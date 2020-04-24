import * as path from "path"
import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import ArbitraryStep from "../../steps/actions/arbitrary-step"
import ParallelStep from "../../steps/aggregators/parallel-step"
import SerialStep from "../../steps/aggregators/serial-step"
import DeleteFromKeyValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import WriteFileStep from "../../steps/actions/files/write-file-step"
import ParseTypeScriptStep from "../../steps/actions/type-script/parse-type-script-step"
import gameSvgDefStore from "../../stores/game-svg-def-store"
import gameSvgTypeScriptTextStore from "../../stores/game-svg-type-script-text-store"
import gameSvgTypeScriptParsedStore from "../../stores/game-svg-type-script-parsed-store"
import gameSvgDefCombinationStore from "../../stores/game-svg-def-combination-store"

function getOrderedTypeScriptNames(game: string): ReadonlyArray<string> {
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
    `svgCombination`,
    false,
    item => item,
    item => [
      new DeleteFromKeyValueStoreIfSetStep(gameSvgTypeScriptTextStore, item),
      new DeleteFromKeyValueStoreIfSetStep(gameSvgTypeScriptParsedStore, item),
      new DeleteFromKeyValueStoreIfSetStep(gameSvgDefCombinationStore, item),
    ],
    item => [
      new ParallelStep(
        `typeScriptAndSvg`,
        [
          new SerialStep(`typeScript`, [
            new ArbitraryStep(
              `generateTypeScript`,
              async () => {
                gameSvgTypeScriptTextStore.set(item, `
                  ${getOrderedTypeScriptNames(item)
                    .map((typeScriptName, index) => `type ${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)} = \`d${index}\``)
                    .join(`\n`)}

                  type AnySvg = ${getOrderedTypeScriptNames(item).map((typeScriptName, index) => `\`d${index}\``).join(`|`)}

                  ${getOrderedTypeScriptNames(item)
                    .map((typeScriptName, index) => `const ${typeScriptName}: ${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)} = \`d${index}\``)
                    .join(`\n`)}
                `)
              }
            ),
            new ParallelStep(
              `parseAndWrite`,
              [
                new ParseTypeScriptStep(
                  path.join(`.generated-type-script`, `svg.ts`),
                  () => gameSvgTypeScriptTextStore.get(item),
                  parsed => gameSvgTypeScriptParsedStore.set(item, parsed),
                ),
                new WriteFileStep(
                  () => gameSvgTypeScriptTextStore.get(item),
                  path.join(`src`, `games`, item, `src`, `.generated-type-script`, `svg.ts`),
                ),
              ],
            )
          ]),
          new ArbitraryStep(
            `generateSvg`,
            async () => {
              const defs = getOrderedTypeScriptNames(item)
                .map((name, index) => {
                  const def = gameSvgDefStore.get(item, name)

                  const matches = def.match(/(\s)id=""/g)

                  if (matches === null || matches.length !== 1) {
                    throw new Error(`Failed to inject ID into SVG def "${name}".`)
                  }

                  return def.replace(/\sid=""/, `${matches[0].slice(0, matches[0].length - 5)}id="d${index}"`)
                })
                .join(``)

              gameSvgDefCombinationStore.set(item, defs)
            },
          ),
        ],
      ),
    ],
  )
}
