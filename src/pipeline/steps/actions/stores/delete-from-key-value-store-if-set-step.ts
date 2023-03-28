import type KeyValueStore from '../../../stores/key-value-store'
import ActionStepBase from '../action-step-base'

export default class DeleteFromKeyValueStoreIfSetStep<TValue> extends ActionStepBase {
  constructor (
    private readonly keyValueStore: KeyValueStore<TValue>,
    private readonly key: string
  ) {
    super(
      'deleteFromKeyValueStoreIfSet',
      [{
        key: 'keyValueStore',
        value: keyValueStore.name
      }, {
        key: 'key',
        value: key
      }],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.keyValueStore.deleteIfSet(this.key)
  }
}
