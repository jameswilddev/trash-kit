import * as uglifyJs from "uglify-js"
import StepBase from "../step-base"
import ActionStepBase from "./action-step-base"
import iterativelyMinify from "../../utilities/iteratively-minify"

export default class MinifyJsStep extends ActionStepBase {
  constructor(
    private readonly getJavascript: () => string,
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
        const parsed = uglifyJs.minify(previous, {
          compress: true,
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
