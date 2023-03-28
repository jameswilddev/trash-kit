import type ValueStore from '../../../stores/value-store'
import ActionStepBase from '../action-step-base'

export default class DeleteFromValueStoreIfSetStep<TValue> extends ActionStepBase {
  constructor (
    private readonly valueStore: ValueStore<TValue>
  ) {
    super(
      'deleteFromValueStoreIfSet',
      [{
        key: 'valueStore',
        value: valueStore.name
      }],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.valueStore.deleteIfSet()
  }
}
