import * as fs from 'fs'
import ActionStepBase from '../action-step-base'

export default class CreateFolderStep extends ActionStepBase {
  constructor (
    private readonly path: string
  ) {
    super(
      'createFolder',
      [{
        key: 'path',
        value: path
      }],
      () => []
    )
  }

  async execute (): Promise<void> {
    await fs.promises.mkdir(this.path, { recursive: true })
  }
}
