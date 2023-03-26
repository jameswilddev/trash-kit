import * as fs from 'fs'
import ActionStepBase from '../action-step-base'

export default class WriteFileStep extends ActionStepBase {
  constructor (
    private readonly getData: () => string | Buffer,
    private readonly toPath: string
  ) {
    super(
      'writeFile',
      [{
        key: 'toPath',
        value: toPath
      }],
      () => []
    )
  }

  async execute (): Promise<void> {
    await fs.promises.writeFile(this.toPath, this.getData())
  }
}
