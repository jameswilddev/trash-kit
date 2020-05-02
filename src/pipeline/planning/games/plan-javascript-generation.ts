import * as path from "path"
import * as uuid from "uuid"
import * as typeScript from "typescript"
import keyValueObject from "../../utilities/key-value-object"
import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import ArbitraryStep from "../../steps/actions/arbitrary-step"
import DeleteFromKeyValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import CombineTypeScriptStep from "../../steps/actions/type-script/combine-type-script-step"
import MinifyJsStep from "../../steps/actions/minify-js-step"
import gameTypeScriptCombinedJavascriptTextDebugStore from "../../stores/game-type-script-combined-javascript-text-debug-store"
import gameTypeScriptCombinedJavascriptTextProductionStore from "../../stores/game-type-script-combined-javascript-text-production-store"
import gameJavascriptDebugStore from "../../stores/game-javascript-debug-store"
import gameJavascriptProductionStore from "../../stores/game-javascript-production-store"
import engineTypeScriptParsedStore from "../../stores/engine-type-script-parsed-store"
import gameTypeScriptParsedStore from "../../stores/game-type-script-parsed-store"
import SerialStep from "../../steps/aggregators/serial-step"
import ParallelStep from "../../steps/aggregators/parallel-step"
import KeyValueStore from "../../stores/key-value-store"
import gameSvgDefStore from "../../stores/game-svg-def-store"
import gameDeclarationsDebugStore from "../../stores/game-declarations-debug-store"
import gameDeclarationsTypeScriptTextDebugStore from "../../stores/game-declarations-type-script-text-debug-store"
import gameDeclarationsTypeScriptParsedDebugStore from "../../stores/game-declarations-type-script-parsed-debug-store"
import gameDeclarationsProductionStore from "../../stores/game-declarations-production-store"
import gameDeclarationsTypeScriptTextProductionStore from "../../stores/game-declarations-type-script-text-production-store"
import gameDeclarationsTypeScriptParsedProductionStore from "../../stores/game-declarations-type-script-parsed-production-store"
import gameMetadataJsonStore from "../../stores/game-metadata-json-store"
import ParseTypeScriptStep from "../../steps/actions/type-script/parse-type-script-step"
import WriteFileStep from "../../steps/actions/files/write-file-step"
import DeleteStep from "../../steps/actions/files/delete-step"

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
            path.join(`src`, `games`, item, `src`, `.generated-type-script`, `declarations.ts`),
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

          environmentSteps.push(new ArbitraryStep(
            `generateDeclarations`,
            async () => {
              const declarations: types.Declaration[] = []


              declarations.push({
                type: `constant`,
                name: `engineDebug`,
                valueType: JSON.stringify(engineDebug),
                value: engineDebug,
              })

              declarations.push({
                type: `constant`,
                name: `engineUuid`,
                valueType: JSON.stringify(buildUuid),
                value: buildUuid
              })


              const metadata = gameMetadataJsonStore.get(item)

              declarations.push({
                type: `constant`,
                name: `gameName`,
                valueType: JSON.stringify(item),
                value: item,
              })

              declarations.push({
                type: `constant`,
                name: `safeAreaWidthVirtualPixels`,
                valueType: `${metadata.safeAreaWidthVirtualPixels}`,
                value: metadata.safeAreaWidthVirtualPixels,
              })

              declarations.push({
                type: `constant`,
                name: `safeAreaHeightVirtualPixels`,
                valueType: `${metadata.safeAreaHeightVirtualPixels}`,
                value: metadata.safeAreaHeightVirtualPixels,
              })


              const orderedSvgNames = Object
                .keys(gameSvgDefStore.tryGetAllByBaseKey(item))
                .sort()

              orderedSvgNames.forEach((typeScriptName, index) => declarations.push({
                type: `type`,
                name: `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`,
                definition: `\`d${index}\``,
              }))

              declarations.push({
                type: `type`,
                name: `AnySvg`,
                definition: orderedSvgNames.map(typeScriptName => `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`).join(` | `),
              })

              orderedSvgNames.forEach((typeScriptName, index) => declarations.push({
                type: `constant`,
                name: typeScriptName,
                valueType: `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`,
                value: `d${index}`,
              }))

              gameDeclarationsStore.set(item, declarations)
            }
          ))

          environmentSteps.push(new ArbitraryStep(
            `generateDeclarationTypeScript`,
            async () => {
              const declarations = gameDeclarationsStore.get(item)

              const types = declarations
                .filter((declaration): declaration is types.TypeDeclaration => declaration.type === `type`)
                .map(typeDeclaration => `type ${typeDeclaration.name} = ${typeDeclaration.definition}`)

              const constants = declarations
                .filter((declaration): declaration is types.ConstantDeclaration => declaration.type === `constant`)
                .map(constantDeclaration => `declare const ${constantDeclaration.name}: ${constantDeclaration.valueType}`)

              gameDeclarationsTypeScriptTextStore.set(item, types.concat(constants).join(`\n`))
            }
          ))

          if (engineDebug) {
            environmentSteps.push(new WriteFileStep(
              () => gameDeclarationsTypeScriptTextStore.get(item),
              path.join(`src`, `games`, item, `src`, `.generated-type-script`, `declarations.ts`),
            ))
          }

          environmentSteps.push(new ParseTypeScriptStep(
            path.join(`.generated-type-script`, `declarations.ts`),
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
                  path.join(`.generated-type-script`, `declarations.ts`),
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
