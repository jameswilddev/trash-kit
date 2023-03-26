import * as fs from 'fs'
import ActionStepBase from '../action-step-base'

export default class ReadTextFileStep extends ActionStepBase {
  constructor (
    private readonly fromPath: string,
    private readonly storeResult: (text: string) => void
  ) {
    super(
      'readTextFile',
      [{
        key: 'fromPath',
        value: fromPath
      }],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.storeResult(await fs.promises.readFile(this.fromPath, 'utf8'))
  }
}
