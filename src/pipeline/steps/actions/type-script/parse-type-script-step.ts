import * as typeScript from 'typescript'
import ActionStepBase from '../action-step-base'

export default class ParseTypeScriptStep extends ActionStepBase {
  constructor (
    private readonly fileName: string,
    private readonly getText: () => string,
    private readonly storeResult: (parsed: typeScript.SourceFile) => void
  ) {
    super(
      'parseTypeScript',
      [{
        key: 'fileName',
        value: fileName
      }],
      () => []
    )
  }

  async execute (): Promise<void> {
    const result = typeScript.createSourceFile(
      this.fileName,
      this.getText(),
      typeScript.ScriptTarget.ES5,
      false,
      typeScript.ScriptKind.TS
    )
    this.storeResult(result)
  }
}
