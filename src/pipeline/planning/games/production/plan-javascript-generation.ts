import * as path from "path"
import * as uuid from "uuid"
import * as typeScript from "typescript"
import keyValueObject from "../../../utilities/key-value-object"
import * as types from "../../../types"
import Diff from "../../../files/diff"
import StepBase from "../../../steps/step-base"
import DeleteFromKeyValueStoreIfSetStep from "../../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import CombineTypeScriptStep from "../../../steps/actions/type-script/combine-type-script-step"
import MinifyJsStep from "../../../steps/actions/minify-js-step"
import gameTypeScriptCombinedJavascriptTextDebugStore from "../../../stores/game-type-script-combined-javascript-text-debug-store"
import gameTypeScriptCombinedJavascriptTextProductionStore from "../../../stores/game-type-script-combined-javascript-text-production-store"
import gameJavascriptDebugStore from "../../../stores/game-javascript-debug-store"
import gameJavascriptProductionStore from "../../../stores/game-javascript-production-store"
import engineTypeScriptParsedStore from "../../../stores/engine-type-script-parsed-store"
import gameTypeScriptParsedStore from "../../../stores/game-type-script-parsed-store"
import SerialStep from "../../../steps/aggregators/serial-step"
import ParallelStep from "../../../steps/aggregators/parallel-step"
import KeyValueStore from "../../../stores/key-value-store"
import gameDeclarationsDebugStore from "../../../stores/game-declarations-debug-store"
import gameDeclarationsTypeScriptTextDebugStore from "../../../stores/game-declarations-type-script-text-debug-store"
import gameDeclarationsTypeScriptParsedDebugStore from "../../../stores/game-declarations-type-script-parsed-debug-store"
import gameDeclarationsProductionStore from "../../../stores/game-declarations-production-store"
import gameDeclarationsTypeScriptTextProductionStore from "../../../stores/game-declarations-type-script-text-production-store"
import gameDeclarationsTypeScriptParsedProductionStore from "../../../stores/game-declarations-type-script-parsed-production-store"
import ParseTypeScriptStep from "../../../steps/actions/type-script/parse-type-script-step"
import WriteFileStep from "../../../steps/actions/files/write-file-step"
import DeleteStep from "../../../steps/actions/files/delete-step"
import GenerateDeclarations from "../../../steps/actions/generate-declarations"
import ConvertDeclarationsToTypeScriptStep from "../../../steps/actions/convert-declarations-to-type-script-step"

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
          gameDeclarationsStore: KeyValueStore<types.DeclarationSet>,
          gameDeclarationsTypeScriptTextStore: KeyValueStore<string>,
          gameDeclarationsTypeScriptParsedStore: KeyValueStore<typeScript.SourceFile>,
          gameTypeScriptCombinedJavascriptTextStore: KeyValueStore<string>,
          gameJavascriptStore: KeyValueStore<string | types.Versioned<string>>
        ): void {
          const environmentSteps: StepBase[] = []

          environmentSteps.push(new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsStore, item))
          environmentSteps.push(new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptTextStore, item))
          environmentSteps.push(new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptParsedStore, item))

          environmentSteps.push(new DeleteFromKeyValueStoreIfSetStep(
            gameTypeScriptCombinedJavascriptTextStore, item
          ))

          environmentSteps.push(new DeleteFromKeyValueStoreIfSetStep(gameJavascriptStore, item))

          environmentSteps.push(new DeleteStep(
            path.join(`src`, `games`, item, `src`, `.declarations.ts`),
          ))

          steps.push(new ParallelStep(name, environmentSteps))
        }

        addEnvironment(
          `production`,
          gameDeclarationsProductionStore,
          gameDeclarationsTypeScriptTextProductionStore,
          gameDeclarationsTypeScriptParsedProductionStore,
          gameTypeScriptCombinedJavascriptTextProductionStore,
          gameJavascriptProductionStore
        )

        if (debug) {
          addEnvironment(
            `debug`,
            gameDeclarationsDebugStore,
            gameDeclarationsTypeScriptTextDebugStore,
            gameDeclarationsTypeScriptParsedDebugStore,
            gameTypeScriptCombinedJavascriptTextDebugStore,
            gameJavascriptDebugStore
          )
        }

        return steps
      },
      item => {
        const buildUuid = uuid.v4()

        const steps: StepBase[] = []

        function addEnvironment(
          name: string,
          engineDebug: boolean,
          gameDeclarationsStore: KeyValueStore<types.DeclarationSet>,
          gameDeclarationsTypeScriptTextStore: KeyValueStore<string>,
          gameDeclarationsTypeScriptParsedStore: KeyValueStore<typeScript.SourceFile>,
          gameTypeScriptCombinedJavascriptTextStore: KeyValueStore<string>,
          storeJavascript: (javascript: string) => void
        ): void {
          const environmentSteps: StepBase[] = []

          environmentSteps.push(new GenerateDeclarations(item, engineDebug, buildUuid, gameDeclarationsStore))

          environmentSteps.push(new ConvertDeclarationsToTypeScriptStep(item, gameDeclarationsStore, gameDeclarationsTypeScriptTextStore))

          if (engineDebug) {
            environmentSteps.push(new WriteFileStep(
              () => gameDeclarationsTypeScriptTextStore.get(item),
              path.join(`src`, `games`, item, `src`, `.declarations.ts`),
            ))
          }

          environmentSteps.push(new ParseTypeScriptStep(
            `.declarations.ts`,
            () => gameDeclarationsTypeScriptTextStore.get(item),
            parsed => gameDeclarationsTypeScriptParsedStore.set(item, parsed)
          ))

          environmentSteps.push(new CombineTypeScriptStep(
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
                  `.declarations.ts`,
                  gameDeclarationsTypeScriptParsedStore.get(item)
                ),
                nonPlaceholderEngineTypeScript,
                gameTypeScriptParsedStore.tryGetAllByBaseKey(item)
              ]
            },
            javascript => gameTypeScriptCombinedJavascriptTextStore.set(
              item, javascript
            ),
          ))

          environmentSteps.push(new MinifyJsStep(
            () => gameTypeScriptCombinedJavascriptTextStore.get(item),
            () => gameDeclarationsStore.get(item),
            storeJavascript
          ))

          steps.push(new SerialStep(name, environmentSteps))
        }

        addEnvironment(
          `production`,
          false,
          gameDeclarationsProductionStore,
          gameDeclarationsTypeScriptTextProductionStore,
          gameDeclarationsTypeScriptParsedProductionStore,
          gameTypeScriptCombinedJavascriptTextProductionStore,
          javascript => gameJavascriptProductionStore.set(item, javascript)
        )

        if (debug) {
          addEnvironment(
            `debug`,
            true,
            gameDeclarationsDebugStore,
            gameDeclarationsTypeScriptTextDebugStore,
            gameDeclarationsTypeScriptParsedDebugStore,
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
