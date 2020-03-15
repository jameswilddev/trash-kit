import * as path from "path"
import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import ParallelStep from "../../steps/aggregators/parallel-step"
import ArbitraryStep from "../../steps/actions/arbitrary-step"
import DeleteFromKeyValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import ReadTextFileStep from "../../steps/actions/files/read-text-file-step"
import WriteFileStep from "../../steps/actions/files/write-file-step"
import DeleteStep from "../../steps/actions/files/delete-step"
import ParseJsonStep from "../../steps/actions/json/parse-json-step"
import ValidateJsonSchemaStep from "../../steps/actions/json/validate-json-schema-step"
import ParseTypeScriptStep from "../../steps/actions/type-script/parse-type-script-step"
import gameMetadataTextStore from "../../stores/game-metadata-text-store"
import gameMetadataJsonStore from "../../stores/game-metadata-json-store"
import gameMetadataTypeScriptTextStore from "../../stores/game-metadata-type-script-text-store"
import gameMetadataTypeScriptParsedStore from "../../stores/game-metadata-type-script-parsed-store"

export default function (
  metadataDiff: Diff<types.GameMetadataFile>
): StepBase {
  return metadataDiff.generateSteps(
    `generatedTypeScript`,
    false,
    item => item.game,
    item => [
      new DeleteFromKeyValueStoreIfSetStep(gameMetadataTextStore, item.game),
      new DeleteFromKeyValueStoreIfSetStep(gameMetadataJsonStore, item.game),
      new DeleteFromKeyValueStoreIfSetStep(gameMetadataTypeScriptTextStore, item.game),
      new DeleteFromKeyValueStoreIfSetStep(gameMetadataTypeScriptParsedStore, item.game),
      new DeleteStep(path.join(`src`, `games`, item.game, `src`, `.generated-type-script`, `game-name.ts`)),
    ],
    item => [
      new ReadTextFileStep(item.path, text => gameMetadataTextStore.set(item.game, text)),
      new ParseJsonStep<types.MetadataJson>(
        () => gameMetadataTextStore.get(item.game),
        json => gameMetadataJsonStore.set(item.game, json),
      ),
      new ValidateJsonSchemaStep(() => gameMetadataJsonStore.get(item.game), () => ({
        type: `object`,
        additionalProperties: false,
        required: [
          `safeAreaWidthVirtualPixels`,
          `safeAreaHeightVirtualPixels`,
        ],
        properties: {
          safeAreaWidthVirtualPixels: {
            type: `number`,
            minimum: 0,
            exclusiveMinimum: true,
          },
          safeAreaHeightVirtualPixels: {
            type: `number`,
            minimum: 0,
            exclusiveMinimum: true,
          },
        },
      })),
      new ArbitraryStep(
        `generateTypeScript`,
        async () => gameMetadataTypeScriptTextStore.set(
          item.game,
          `
            const gameName = ${JSON.stringify(item.game)}

            const safeAreaWidthVirtualPixels = ${gameMetadataJsonStore.get(item.game).safeAreaWidthVirtualPixels}
            const safeAreaHeightVirtualPixels = ${gameMetadataJsonStore.get(item.game).safeAreaHeightVirtualPixels}
          `,
        ),
      ),
      new ParallelStep(
        `parseAndWrite`,
        [
          new ParseTypeScriptStep(
            path.join(`.generated-type-script`, `game-name.ts`),
            () => gameMetadataTypeScriptTextStore.get(item.game),
            parsed => gameMetadataTypeScriptParsedStore.set(item.game, parsed),
          ),
          new WriteFileStep(
            () => gameMetadataTypeScriptTextStore.get(item.game),
            path.join(`src`, `games`, item.game, `src`, `.generated-type-script`, `game-name.ts`),
          ),
        ],
      )
    ]
  )
}
