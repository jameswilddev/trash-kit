import * as fs from "fs"
import StepBase from "../../step-base"
import ActionStepBase from "../action-step-base"

export default class DeleteStep extends ActionStepBase {
  constructor(
    private readonly pattern: string
  ) {
    super(
      `delete`,
      [{
        key: `pattern`,
        value: pattern
      }],
      (self: StepBase) => []
    )
  }

  async execute(): Promise<void> {
    let stats: null | fs.Stats = null

    try {
      stats = await fs.promises.stat(this.pattern)
    } catch (e) {
      if (e.code === `ENOENT`) {
        return
      }

      throw e
    }

    if (stats.isFile()) {
      await fs.promises.unlink(this.pattern)
    } else if (stats.isDirectory()) {
      await fs.promises.rmdir(this.pattern, { recursive: true })
    } else {
      throw new Error(`Unclear how to delete "${this.pattern}" (not a file or directory).`)
    }
  }
}
