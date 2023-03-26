import * as path from 'path'
import * as uuid from 'uuid'
import type * as typeScript from 'typescript'
import type * as types from '../../../types'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import DeleteFromKeyValueStoreIfSetStep from '../../../steps/actions/stores/delete-from-key-value-store-if-set-step'
import CombineTypeScriptStep from '../../../steps/actions/type-script/combine-type-script-step'
import gameTypeScriptCombinedJavascriptTextDebugStore from '../../../stores/game-type-script-combined-javascript-text-debug-store'
import engineTypeScriptParsedStore from '../../../stores/engine-type-script-parsed-store'
import gameTypeScriptParsedStore from '../../../stores/game-type-script-parsed-store'
import gameDeclarationsDebugStore from '../../../stores/game-declarations-debug-store'
import gameDeclarationsTypeScriptTextDebugStore from '../../../stores/game-declarations-type-script-text-debug-store'
import gameDeclarationsTypeScriptParsedDebugStore from '../../../stores/game-declarations-type-script-parsed-debug-store'
import ParseTypeScriptStep from '../../../steps/actions/type-script/parse-type-script-step'
import WriteFileStep from '../../../steps/actions/files/write-file-step'
import DeleteStep from '../../../steps/actions/files/delete-step'
import GenerateDeclarationsStep from '../../../steps/actions/generate-declarations-step'
import ConvertDeclarationsToTypeScriptStep from '../../../steps/actions/convert-declarations-to-type-script-step'

export default function (
  enginePlanningResult: types.EnginePlanningResult,
  allSorted: Diff<types.GameFile>
): StepBase {
  return allSorted
    .mapItems(item => item.game)
    .deduplicateItems()
    .generateSteps(
      'javascriptGeneration',
      enginePlanningResult.allGamesRequireJavascriptRegeneration,
      item => item,
      item => [
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsDebugStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptTextDebugStore, item),
        new DeleteStep(path.join('src', 'games', item, 'src', '.declarations.ts')),
        new DeleteFromKeyValueStoreIfSetStep(gameDeclarationsTypeScriptParsedDebugStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameTypeScriptCombinedJavascriptTextDebugStore, item)
      ],
      item => {
        const buildUuid = uuid.v4()

        return [
          new GenerateDeclarationsStep(item, true, buildUuid, gameDeclarationsDebugStore),
          new ConvertDeclarationsToTypeScriptStep(false, item, gameDeclarationsDebugStore, gameDeclarationsTypeScriptTextDebugStore),
          new WriteFileStep(() => gameDeclarationsTypeScriptTextDebugStore.get(item), path.join('src', 'games', item, 'src', '.declarations.ts')),
          new ParseTypeScriptStep('.declarations.ts', () => gameDeclarationsTypeScriptTextDebugStore.get(item), parsed => { gameDeclarationsTypeScriptParsedDebugStore.set(item, parsed) }),
          new CombineTypeScriptStep(
            () => {
              const allEngineTypeScript = engineTypeScriptParsedStore.getAll()
              const nonPlaceholderEngineTypeScript = new Map<string, typeScript.SourceFile>()
              for (const [key, value] of allEngineTypeScript) {
                if (!key.endsWith('.d.ts')) {
                  nonPlaceholderEngineTypeScript.set(key, value)
                }
              }
              return [
                new Map([[
                  '.declarations.ts',
                  gameDeclarationsTypeScriptParsedDebugStore.get(item)]
                ]),
                nonPlaceholderEngineTypeScript,
                gameTypeScriptParsedStore.tryGetAllByBaseKey(item)
              ]
            },
            javascript => { gameTypeScriptCombinedJavascriptTextDebugStore.set(item, { uuid: buildUuid, payload: javascript }) }
          )
        ]
      }
    )
}
