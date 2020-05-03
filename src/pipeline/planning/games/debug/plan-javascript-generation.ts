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
import gameJavascriptDebugStore from "../../../stores/game-javascript-debug-store"
import engineTypeScriptParsedStore from "../../../stores/engine-type-script-parsed-store"
import gameTypeScriptParsedStore from "../../../stores/game-type-script-parsed-store"
import gameDeclarationsDebugStore from "../../../stores/game-declarations-debug-store"
import gameDeclarationsTypeScriptTextDebugStore from "../../../stores/game-declarations-type-script-text-debug-store"
import gameDeclarationsTypeScriptParsedDebugStore from "../../../stores/game-declarations-type-script-parsed-debug-store"
import ParseTypeScriptStep from "../../../steps/actions/type-script/parse-type-script-step"
import WriteFileStep from "../../../steps/actions/files/write-file-step"
import DeleteStep from "../../../steps/actions/files/delete-step"
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
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsDebugStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptTextDebugStore, item),
        new DeleteStep(path.join(`src`, `games`, item, `src`, `.declarations.ts`)),
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptParsedDebugStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameTypeScriptCombinedJavascriptTextDebugStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameJavascriptDebugStore, item),
      ],
      item => {
        const buildUuid = uuid.v4()

        return [
          new GenerateDeclarationsStep(item, true, buildUuid, gameDeclarationsDebugStore),
          new ConvertDeclarationsToTypeScriptStep(item, gameDeclarationsDebugStore, gameDeclarationsTypeScriptTextDebugStore),
          new WriteFileStep(() => gameDeclarationsTypeScriptTextDebugStore.get(item), path.join(`src`, `games`, item, `src`, `.declarations.ts`)),
          new ParseTypeScriptStep(`.declarations.ts`, () => gameDeclarationsTypeScriptTextDebugStore.get(item), parsed => gameDeclarationsTypeScriptParsedDebugStore.set(item, parsed)),
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
                  gameDeclarationsTypeScriptParsedDebugStore.get(item)
                ),
                nonPlaceholderEngineTypeScript,
                gameTypeScriptParsedStore.tryGetAllByBaseKey(item)
              ]
            },
            javascript => gameTypeScriptCombinedJavascriptTextDebugStore.set(
              item, javascript
            ),
          ),
          new MinifyJsStep(
            () => gameTypeScriptCombinedJavascriptTextDebugStore.get(item),
            () => gameDeclarationsDebugStore.get(item),
            code => gameJavascriptDebugStore.set(item, {
              payload: code,
              uuid: buildUuid,
            }),
          ),
        ]
      }
    )
}
