import * as path from 'path'
import type * as types from '../../../types'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import DeleteFromKeyValueStoreIfSetStep from '../../../steps/actions/stores/delete-from-key-value-store-if-set-step'
import DeleteStep from '../../../steps/actions/files/delete-step'
import RenderPugStep from '../../../steps/actions/pug/render-pug-step'
import MinifyHtmlStep from '../../../steps/actions/minify-html-step'
import ZipStep from '../../../steps/actions/zip-step'
import ArbitraryStep from '../../../steps/actions/arbitrary-step'
import WriteFileStep from '../../../steps/actions/files/write-file-step'
import gameHtmlProductionStore from '../../../stores/game-html-production-store'
import gameMinifiedHtmlProductionStore from '../../../stores/game-minified-html-production-store'
import gameZipStore from '../../../stores/game-zip-store'
import enginePugStore from '../../../stores/engine-pug-store'
import gameJavascriptProductionStore from '../../../stores/game-javascript-production-store'
import gameMetadataJsonStore from '../../../stores/game-metadata-json-store'
import gameSvgDefCombinationStore from '../../../stores/game-svg-def-combination-store'

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  games: Diff<string>
): StepBase {
  return games
    .generateSteps(
      'htmlGeneration',
      enginePlanningResult.allGamesRequireHtmlRegeneration,
      item => item,
      item => {
        const steps: StepBase[] = [
          new DeleteFromKeyValueStoreIfSetStep(gameHtmlProductionStore, item),
          new DeleteFromKeyValueStoreIfSetStep(gameMinifiedHtmlProductionStore, item),
          new DeleteFromKeyValueStoreIfSetStep(gameZipStore, item)
        ]

        if (!debug) {
          steps.push(
            new DeleteStep(path.join('dist', `${item}.zip`)),
            new DeleteStep(path.join('dist', `${item}.html`))
          )
        }

        return steps
      },
      item => {
        const steps: StepBase[] = [
          new RenderPugStep(
            () => enginePugStore.get(),
            () => {
              const metadata = gameMetadataJsonStore.get(item)

              return {
                javascript: gameJavascriptProductionStore.get(item),
                backgroundColor: metadata.backgroundColor,
                safeAreaWidthVirtualPixels: metadata.safeAreaWidthVirtualPixels,
                safeAreaHeightVirtualPixels: metadata.safeAreaHeightVirtualPixels,
                defs: gameSvgDefCombinationStore.get(item)
              }
            },
            html => { gameHtmlProductionStore.set(item, html) }
          ),
          new MinifyHtmlStep(
            () => gameHtmlProductionStore.get(item),
            html => { gameMinifiedHtmlProductionStore.set(item, html) }
          )
        ]

        if (!debug) {
          steps.push(new WriteFileStep(() => gameMinifiedHtmlProductionStore.get(item), path.join('dist', `${item}.html`)))
        }

        steps.push(
          new ZipStep(
            () => new Map([[
              'index.html',
              Buffer.from(gameMinifiedHtmlProductionStore.get(item), 'utf8')
            ]]),
            buffer => { gameZipStore.set(item, buffer) }
          ),
          new ArbitraryStep(
            'checkZipSize',
            async () => {
              const bytes = gameZipStore.get(item).byteLength
              const maximumBytes = 13312
              const percentage = bytes * 100 / maximumBytes
              if (bytes > maximumBytes) {
                throw new Error(`The zip exceeds the size limit of ${maximumBytes} bytes by ${bytes - maximumBytes} bytes (${percentage - 100}%) at ${bytes} bytes (${percentage}%).`)
              } else {
                console.log()
                console.log(`Zip within size limit of ${maximumBytes} bytes at ${bytes} bytes (${percentage}%).`)
              }
            }
          )
        )

        if (!debug) {
          steps.push(new WriteFileStep(() => gameZipStore.get(item), path.join('dist', `${item}.zip`)))
        }

        return steps
      }
    )
}
