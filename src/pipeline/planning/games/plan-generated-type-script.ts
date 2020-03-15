import * as path from "path"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import SerialStep from "../../steps/aggregators/serial-step"
import ParallelStep from "../../steps/aggregators/parallel-step"
import ArbitraryStep from "../../steps/actions/arbitrary-step"
import DeleteFromKeyValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import WriteFileStep from "../../steps/actions/files/write-file-step"
import ParseTypeScriptStep from "../../steps/actions/type-script/parse-type-script-step"
import gameMetadataTypeScriptTextStore from "../../stores/game-metadata-type-script-text-store"
import gameMetadataTypeScriptParsedStore from "../../stores/game-metadata-type-script-parsed-store"

export default function (
  games: Diff<string>
): StepBase {
  const additions: ReadonlyArray<StepBase> = games
    .added
    .map(game => new SerialStep(
      game,
      [
        new ArbitraryStep(
          `generateTypeScript`,
          async () => gameMetadataTypeScriptTextStore.set(
          )
        ),
        new ParallelStep(
          `parseAndWrite`,
          [
            new ParseTypeScriptStep(
              path.join(`.generated-type-script`, `game-name.ts`),
              () => gameMetadataTypeScriptTextStore.get(game),
              parsed => gameMetadataTypeScriptParsedStore.set(game, parsed)
            ),
            new WriteFileStep(
              () => gameMetadataTypeScriptTextStore.get(game),
              path.join(`src`, `games`, game, `src`, `.generated-type-script`, `game-name.ts`)
            )
          ]
        )
      ]
    ))

  const deletionGameNameTypeScriptTextStoreRemovals: ReadonlyArray<StepBase> = games
    .deleted
    .map(game => new DeleteFromKeyValueStoreIfSetStep(
      gameMetadataTypeScriptTextStore,
      game
    ))

  const deletionGameNameTypeScriptParsedStoreRemovals: ReadonlyArray<StepBase> = games
    .deleted
    .map(game => new DeleteFromKeyValueStoreIfSetStep(
      gameMetadataTypeScriptParsedStore,
      game
    ))

  return new ParallelStep(
    `generatedTypescript`,
    additions
      .concat(deletionGameNameTypeScriptTextStoreRemovals)
      .concat(deletionGameNameTypeScriptParsedStoreRemovals)
  )
}
