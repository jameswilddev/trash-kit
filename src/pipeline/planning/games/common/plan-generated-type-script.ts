import type * as types from '../../../types'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import DeleteFromKeyValueStoreIfSetStep from '../../../steps/actions/stores/delete-from-key-value-store-if-set-step'
import ReadTextFileStep from '../../../steps/actions/files/read-text-file-step'
import ParseJsonStep from '../../../steps/actions/json/parse-json-step'
import ValidateJsonSchemaStep from '../../../steps/actions/json/validate-json-schema-step'
import gameMetadataTextStore from '../../../stores/game-metadata-text-store'
import gameMetadataJsonStore from '../../../stores/game-metadata-json-store'

export default function (
  metadataDiff: Diff<types.GameMetadataFile>
): StepBase {
  return metadataDiff.generateSteps(
    'generatedTypeScript',
    false,
    item => item.game,
    item => [
      new DeleteFromKeyValueStoreIfSetStep(gameMetadataTextStore, item.game),
      new DeleteFromKeyValueStoreIfSetStep(gameMetadataJsonStore, item.game)
    ],
    item => [
      new ReadTextFileStep(item.path, text => { gameMetadataTextStore.set(item.game, text) }),
      new ParseJsonStep<types.MetadataJson>(
        () => gameMetadataTextStore.get(item.game),
        json => { gameMetadataJsonStore.set(item.game, json) }
      ),
      new ValidateJsonSchemaStep(() => gameMetadataJsonStore.get(item.game), () => ({
        type: 'object',
        additionalProperties: false,
        required: [
          'safeAreaWidthVirtualPixels',
          'safeAreaHeightVirtualPixels',
          'backgroundColor'
        ],
        properties: {
          safeAreaWidthVirtualPixels: {
            type: 'number',
            minimum: 0,
            exclusiveMinimum: true
          },
          safeAreaHeightVirtualPixels: {
            type: 'number',
            minimum: 0,
            exclusiveMinimum: true
          },
          backgroundColor: {
            type: 'string',
            pattern: '^#[0-9a-f]{3}$'
          }
        }
      }))
    ]
  )
}
