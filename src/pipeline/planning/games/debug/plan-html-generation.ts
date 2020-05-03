import * as types from "../../../types"
import Diff from "../../../files/diff"
import StepBase from "../../../steps/step-base"
import DeleteFromKeyValueStoreIfSetStep from "../../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import RenderPugStep from "../../../steps/actions/pug/render-pug-step"
import MinifyHtmlStep from "../../../steps/actions/minify-html-step"
import gameHtmlDebugStore from "../../../stores/game-html-debug-store"
import gameMinifiedHtmlDebugStore from "../../../stores/game-minified-html-debug-store"
import enginePugStore from "../../../stores/engine-pug-store"
import gameJavascriptDebugStore from "../../../stores/game-javascript-debug-store"
import gameMetadataJsonStore from "../../../stores/game-metadata-json-store"
import gameSvgDefCombinationStore from "../../../stores/game-svg-def-combination-store"

export default function (
  enginePlanningResult: types.EnginePlanningResult,
  games: Diff<string>
): StepBase {
  return games
    .generateSteps(
      `htmlGeneration`,
      enginePlanningResult.allGamesRequireHtmlRegeneration,
      item => item,
      item => [
        new DeleteFromKeyValueStoreIfSetStep(gameHtmlDebugStore, item),
        new DeleteFromKeyValueStoreIfSetStep(gameMinifiedHtmlDebugStore, item),
      ],
      item => [
        new RenderPugStep(
          () => enginePugStore.get(),
          () => {
            const metadata = gameMetadataJsonStore.get(item)

            return {
              javascript: gameJavascriptDebugStore.get(item).payload,
              backgroundColor: metadata.backgroundColor,
              safeAreaWidthVirtualPixels: metadata.safeAreaWidthVirtualPixels,
              safeAreaHeightVirtualPixels: metadata.safeAreaHeightVirtualPixels,
              defs: gameSvgDefCombinationStore.get(item),
            }
          },
          html => gameHtmlDebugStore.set(item, {
            payload: html,
            uuid: gameJavascriptDebugStore.get(item).uuid,
          })
        ),
        new MinifyHtmlStep(
          () => gameHtmlDebugStore.get(item).payload,
          html => gameMinifiedHtmlDebugStore.set(item, {
            payload: html,
            uuid: gameHtmlDebugStore.get(item).uuid
          })
        ),
      ]
    )
}
