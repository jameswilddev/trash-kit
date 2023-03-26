import * as uglifyJs from 'uglify-js'
import type * as types from '../../types'
import ActionStepBase from './action-step-base'
import iterativelyMinify from '../../utilities/iteratively-minify'

export default class MinifyJsStep extends ActionStepBase {
  constructor (
    private readonly getJavascript: () => string,
    private readonly getDeclarations: () => types.DeclarationSet,
    private readonly storeResult: (code: string) => void
  ) {
    super(
      'parseUglifyJs',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.storeResult(await iterativelyMinify(
      this.getJavascript(),
      async previous => {
        const globalDefs: Record<string, types.Json> = {}

        this
          .getDeclarations()
          .filter((declaration): declaration is types.ConstantDeclaration => declaration.type === 'constant')
          .forEach(constantDeclaration => {
            globalDefs[constantDeclaration.name] = constantDeclaration.value
          })

        const parsed = uglifyJs.minify(previous, {
          compress: {
            global_defs: globalDefs
          },
          mangle: true,
          toplevel: true
        })

        if (parsed.error != null) {
          throw new Error(`Error minifying Javascript: ${JSON.stringify(parsed.error)}`)
        }

        return parsed.code
      }
    ))
  }
}
