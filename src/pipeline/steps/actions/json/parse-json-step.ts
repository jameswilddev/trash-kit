import type * as types from '../../../types'
import ActionStepBase from '../action-step-base'

export default class ParseJsonStep<T extends types.Json> extends ActionStepBase {
  constructor (
    private readonly getText: () => string,
    private readonly storeJson: (json: T) => void
  ) {
    super(
      'parseJson',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.storeJson(JSON.parse(this.getText()))
  }
}
