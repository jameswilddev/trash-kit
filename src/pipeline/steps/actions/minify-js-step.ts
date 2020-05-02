import * as uglifyJs from "uglify-js"
import * as types from "../../types"
import StepBase from "../step-base"
import ActionStepBase from "./action-step-base"
import iterativelyMinify from "../../utilities/iteratively-minify"

export default class MinifyJsStep extends ActionStepBase {
  constructor(
    private readonly getJavascript: () => string,
    private readonly getDeclarations: () => types.DeclarationSet,
    private readonly storeResult: (code: string) => void
  ) {
    super(
      `parseUglifyJs`,
      [],
      (self: StepBase) => []
    )
  }

  async execute(): Promise<void> {
    this.storeResult(await iterativelyMinify(
      this.getJavascript(),
      async previous => {
        const global_defs: { [key: string]: types.Json } = {}

        this
          .getDeclarations()
          .filter((declaration): declaration is types.ConstantDeclaration => declaration.type === `constant`)
          .forEach(constantDeclaration => global_defs[constantDeclaration.name] = constantDeclaration.value)

        const parsed = uglifyJs.minify(previous, {
          compress: {
            global_defs,
          },
          mangle: true,
          toplevel: true,
        })

        if (parsed.error) {
          throw new Error(`Error minifying Javascript: ${JSON.stringify(parsed.error)}`)
        }

        return parsed.code
      }
    ))
  }
}
