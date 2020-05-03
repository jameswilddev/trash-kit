import * as uuid from "uuid"
import * as typeScript from "typescript"
import keyValueObject from "../../../utilities/key-value-object"
import * as types from "../../../types"
import Diff from "../../../files/diff"
import StepBase from "../../../steps/step-base"
import DeleteFromKeyValueStoreIfSetStep from "../../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import CombineTypeScriptStep from "../../../steps/actions/type-script/combine-type-script-step"
import MinifyJsStep from "../../../steps/actions/minify-js-step"
import gameTypeScriptCombinedJavascriptTextProductionStore from "../../../stores/game-type-script-combined-javascript-text-production-store"
import gameJavascriptProductionStore from "../../../stores/game-javascript-production-store"
import engineTypeScriptParsedStore from "../../../stores/engine-type-script-parsed-store"
import gameTypeScriptParsedStore from "../../../stores/game-type-script-parsed-store"
import gameDeclarationsProductionStore from "../../../stores/game-declarations-production-store"
import gameDeclarationsTypeScriptTextProductionStore from "../../../stores/game-declarations-type-script-text-production-store"
import gameDeclarationsTypeScriptParsedProductionStore from "../../../stores/game-declarations-type-script-parsed-production-store"
import ParseTypeScriptStep from "../../../steps/actions/type-script/parse-type-script-step"
import GenerateDeclarationsStep from "../../../steps/actions/generate-declarations-step"
import ConvertDeclarationsToTypeScriptStep from "../../../steps/actions/convert-declarations-to-type-script-step"

export default function (
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
      item => [
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsProductionStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptTextProductionStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptParsedProductionStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameTypeScriptCombinedJavascriptTextProductionStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameJavascriptProductionStore, item),
      ],
      item => {
        const buildUuid = uuid.v4()

        return [
          new GenerateDeclarationsStep(item, false, buildUuid, gameDeclarationsProductionStore),
          new ConvertDeclarationsToTypeScriptStep(true, item, gameDeclarationsProductionStore, gameDeclarationsTypeScriptTextProductionStore),
          new ParseTypeScriptStep(`.declarations.ts`, () => gameDeclarationsTypeScriptTextProductionStore.get(item), parsed => gameDeclarationsTypeScriptParsedProductionStore.set(item, parsed)),
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
                  `.declarations.ts`,
                  gameDeclarationsTypeScriptParsedProductionStore.get(item)
                ),
                nonPlaceholderEngineTypeScript,
                gameTypeScriptParsedStore.tryGetAllByBaseKey(item)
              ]
            },
            javascript => gameTypeScriptCombinedJavascriptTextProductionStore.set(
              item, javascript
            ),
          ),
          new MinifyJsStep(() => gameTypeScriptCombinedJavascriptTextProductionStore.get(item), () => gameDeclarationsProductionStore.get(item), code => gameJavascriptProductionStore.set(item, code)),
        ]
      }
    )
}
