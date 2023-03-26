import ActionStepBase from './action-step-base'

export default class ArbitraryStep extends ActionStepBase {
  constructor (
    name: string,
    private readonly callback: () => Promise<void>
  ) {
    super(
      name,
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    await this.callback()
  }
}
