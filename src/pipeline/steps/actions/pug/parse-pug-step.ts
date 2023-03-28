import * as pug from 'pug'
import ActionStepBase from '../action-step-base'

export default class ParsePugStep extends ActionStepBase {
  constructor (
    private readonly fromPath: string,
    private readonly storeResult: (parsed: pug.compileTemplate) => void
  ) {
    super(
      'parsePug',
      [{
        key: 'fromPath',
        value: fromPath
      }],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.storeResult(pug.compileFile(this.fromPath))
  }
}
