import * as path from "path"
import uuid = require("uuid")
import * as typeScript from "typescript"
import keyValueObject from "../../utilities/key-value-object"
import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import DeleteFromKeyValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import CombineTypeScriptStep from "../../steps/actions/type-script/combine-type-script-step"
import MinifyJsStep from "../../steps/actions/minify-js-step"
import gameNameTypeScriptParsedStore from "../../stores/game-metadata-type-script-parsed-store"
import gameTypeScriptCombinedJavascriptTextDebugStore from "../../stores/game-type-script-combined-javascript-text-debug-store"
import gameTypeScriptCombinedJavascriptTextProductionStore from "../../stores/game-type-script-combined-javascript-text-production-store"
import gameJavascriptDebugStore from "../../stores/game-javascript-debug-store"
import gameJavascriptProductionStore from "../../stores/game-javascript-production-store"
import gameSvgTypeScriptParsedStore from "../../stores/game-svg-type-script-parsed-store"
import engineTypeScriptParsedStore from "../../stores/engine-type-script-parsed-store"
import gameTypeScriptParsedStore from "../../stores/game-type-script-parsed-store"
import SerialStep from "../../steps/aggregators/serial-step"
import ValueStore from "../../stores/value-store"
import ParallelStep from "../../steps/aggregators/parallel-step"
import KeyValueStore from "../../stores/key-value-store"
import environmentParsedDebugStore from "../../stores/environment-parsed-debug-store"
import environmentParsedProductionStore from "../../stores/environment-parsed-production-store"

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  allSorted: Diff<types.GameFile>
): StepBase {
  return allSorted
    .mapItems(item => item.game)
    .deduplicateItems()
    .generateSteps(
      `javascriptGeneration`,
      enginePlanningResult.allGamesRequireJavascriptRegeneration,
      item => item,
      item => {
        const steps: StepBase[] = []

        function addEnvironment(
          name: string,
          gameTypeScriptCombinedJavascriptTextStore: KeyValueStore<string>,
          gameJavascriptStore: KeyValueStore<string | types.Versioned<string>>
        ): void {
          steps.push(new ParallelStep(name, [
            new DeleteFromKeyValueStoreIfSetStep(
              gameTypeScriptCombinedJavascriptTextStore, item
            ),
            new DeleteFromKeyValueStoreIfSetStep(gameJavascriptStore, item)
          ]))
        }

        addEnvironment(
          `production`,
          gameTypeScriptCombinedJavascriptTextProductionStore,
          gameJavascriptProductionStore
        )

        if (debug) {
          addEnvironment(
            `debug`,
            gameTypeScriptCombinedJavascriptTextDebugStore,
            gameJavascriptDebugStore
          )
        }

        return steps
      },
      item => {
        const steps: StepBase[] = []

        const buildUuid = uuid.v4()

        function addEnvironment(
          name: string,
          environmentParsedStore: ValueStore<typeScript.SourceFile>,
          gameTypeScriptCombinedJavascriptTextStore: KeyValueStore<string>,
          storeJavascript: (javascript: string) => void
        ): void {
          steps.push(new SerialStep(name, [
            new CombineTypeScriptStep(
              () => {
                const allEngineTypeScript = engineTypeScriptParsedStore.getAll()
                const nonPlaceholderEngineTypeScript: { [key: string]: typeScript.SourceFile } = {}
                for (const key of Object
                  .keys(allEngineTypeScript)
                  .filter(key => !key.endsWith(`.d.ts`))) {
                  nonPlaceholderEngineTypeScript[key] = allEngineTypeScript[key]
                }
                return [
                  keyValueObject(
                    path.join(`.generated-type-script`, `environment.ts`),
                    environmentParsedStore.get()
                  ),
                  nonPlaceholderEngineTypeScript,
                  keyValueObject(
                    path.join(`.generated-type-script`, `metadata.ts`),
                    gameNameTypeScriptParsedStore.get(item)
                  ),
                  keyValueObject(
                    path.join(`.generated-type-script`, `svg.ts`),
                    gameSvgTypeScriptParsedStore.get(item)
                  ),
                  gameTypeScriptParsedStore.tryGetAllByBaseKey(item)
                ]
              },
              javascript => gameTypeScriptCombinedJavascriptTextStore.set(
                item, javascript
              ),
            ),
            new MinifyJsStep(
              () => gameTypeScriptCombinedJavascriptTextStore.get(item),
              storeJavascript
            ),
          ]))
        }

        addEnvironment(
          `production`,
          environmentParsedProductionStore,
          gameTypeScriptCombinedJavascriptTextProductionStore,
          javascript => gameJavascriptProductionStore.set(item, javascript)
        )

        if (debug) {
          addEnvironment(
            `debug`,
            environmentParsedDebugStore,
            gameTypeScriptCombinedJavascriptTextDebugStore,
            javascript => gameJavascriptDebugStore.set(item, {
              payload: javascript,
              uuid: buildUuid,
            })
          )
        }

        return steps
      }
    )
}
