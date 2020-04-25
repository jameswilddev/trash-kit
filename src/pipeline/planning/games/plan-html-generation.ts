import * as path from "path"
import uuid = require("uuid")
import keyValueObject from "../../utilities/key-value-object"
import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import DeleteFromKeyValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import DeleteStep from "../../steps/actions/files/delete-step"
import RenderPugStep from "../../steps/actions/pug/render-pug-step"
import MinifyHtmlStep from "../../steps/actions/minify-html-step"
import ZipStep from "../../steps/actions/zip-step"
import ArbitraryStep from "../../steps/actions/arbitrary-step"
import WriteFileStep from "../../steps/actions/files/write-file-step"
import gameHtmlDebugStore from "../../stores/game-html-debug-store"
import gameHtmlProductionStore from "../../stores/game-html-production-store"
import gameMinifiedHtmlDebugStore from "../../stores/game-minified-html-debug-store"
import gameMinifiedHtmlProductionStore from "../../stores/game-minified-html-production-store"
import gameZipStore from "../../stores/game-zip-store"
import enginePugStore from "../../stores/engine-pug-store"
import gameJavascriptDebugStore from "../../stores/game-javascript-debug-store"
import gameJavascriptProductionStore from "../../stores/game-javascript-production-store"
import gameMetadataJsonStore from "../../stores/game-metadata-json-store"
import gameSvgDefCombinationStore from "../../stores/game-svg-def-combination-store"
import ParallelStep from "../../steps/aggregators/parallel-step"
import SerialStep from "../../steps/aggregators/serial-step"

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  games: Diff<string>
): StepBase {
  return games
    .generateSteps(
      `htmlGeneration`,
      enginePlanningResult.allGamesRequireHtmlRegeneration,
      item => item,
      item => {
        const steps: StepBase[] = [
          new DeleteFromKeyValueStoreIfSetStep(gameHtmlProductionStore, item),
          new DeleteFromKeyValueStoreIfSetStep(gameMinifiedHtmlProductionStore, item),
          new DeleteFromKeyValueStoreIfSetStep(gameZipStore, item),
          new DeleteStep(path.join(`dist`, `${item}.zip`)),
          new DeleteStep(path.join(`dist`, `${item}.html`))
        ]

        if (debug) {
          steps.push(new DeleteFromKeyValueStoreIfSetStep(gameHtmlDebugStore, item))
          steps.push(new DeleteFromKeyValueStoreIfSetStep(gameMinifiedHtmlDebugStore, item))
        }

        return steps
      },
      item => {
        const environments: SerialStep[] = [
          new SerialStep(
            `production`,
            [
              new RenderPugStep(
                () => enginePugStore.get(),
                () => {
                  const metadata = gameMetadataJsonStore.get(item)

                  return {
                    javascript: gameJavascriptProductionStore.get(item),
                    backgroundColor: metadata.backgroundColor,
                    safeAreaWidthVirtualPixels: metadata.safeAreaWidthVirtualPixels,
                    safeAreaHeightVirtualPixels: metadata.safeAreaHeightVirtualPixels,
                    defs: gameSvgDefCombinationStore.get(item),
                  }
                },
                html => gameHtmlProductionStore.set(item, html)
              ),
              new MinifyHtmlStep(
                () => gameHtmlProductionStore.get(item),
                html => gameMinifiedHtmlProductionStore.set(item, html)
              ),
              new WriteFileStep(
                () => gameMinifiedHtmlProductionStore.get(item),
                path.join(`dist`, `${item}.html`)
              ),
              new ZipStep(
                () => keyValueObject(
                  `index.html`,
                  Buffer.from(gameMinifiedHtmlProductionStore.get(item), `utf8`)
                ),
                buffer => gameZipStore.set(item, buffer)
              ),
              new ArbitraryStep(
                `checkZipSize`,
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
              ),
              new WriteFileStep(
                () => gameZipStore.get(item),
                path.join(`dist`, `${item}.zip`)
              )
            ]
          )
        ]

        if (debug) {
          environments.push(new SerialStep(
            `debug`,
            [
              new RenderPugStep(
                () => enginePugStore.get(),
                () => {
                  const metadata = gameMetadataJsonStore.get(item)

                  return {
                    javascript: gameJavascriptDebugStore.get(item),
                    backgroundColor: metadata.backgroundColor,
                    safeAreaWidthVirtualPixels: metadata.safeAreaWidthVirtualPixels,
                    safeAreaHeightVirtualPixels: metadata.safeAreaHeightVirtualPixels,
                    defs: gameSvgDefCombinationStore.get(item),
                  }
                },
                html => gameHtmlDebugStore.set(item, html)
              ),
              new MinifyHtmlStep(
                () => gameHtmlDebugStore.get(item),
                html => gameMinifiedHtmlDebugStore.set(item, {
                  payload: html,
                  uuid: uuid.v4()
                })
              ),
            ]
          ))
        }

        return [
          new ParallelStep(`environments`, environments)
        ]
      }
    )
}
