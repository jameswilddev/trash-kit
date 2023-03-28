import type * as pug from 'pug'
import ActionStepBase from '../action-step-base'

export default class RenderPugStep extends ActionStepBase {
  constructor (
    private readonly getParsed: () => pug.compileTemplate,
    private readonly getLocals: () => pug.LocalsObject,
    private readonly storeResult: (html: string) => void
  ) {
    super(
      'renderPug',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.storeResult(this.getParsed()(this.getLocals()))
  }
}
