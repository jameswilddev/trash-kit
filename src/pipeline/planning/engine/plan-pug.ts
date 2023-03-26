import type * as types from '../../types'
import type Diff from '../../files/diff'
import type StepBase from '../../steps/step-base'
import DeleteFromValueStoreIfSetStep from '../../steps/actions/stores/delete-from-value-store-if-set-step'
import ParsePugStep from '../../steps/actions/pug/parse-pug-step'
import enginePugStore from '../../stores/engine-pug-store'

export default function (
  pugDiff: Diff<types.EngineFile>
): StepBase {
  return pugDiff.generateSteps(
    'pug',
    false,
    item => item.name,
    () => [new DeleteFromValueStoreIfSetStep(enginePugStore)],
    item => [
      new ParsePugStep(
        item.path,
        parsed => { enginePugStore.set(parsed) }
      )
    ]
  )
}
