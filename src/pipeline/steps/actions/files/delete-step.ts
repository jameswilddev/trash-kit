import * as fs from "fs"
import StepBase from "../../step-base"
import ActionStepBase from "../action-step-base"

export default class DeleteStep extends ActionStepBase {
  constructor(
    private readonly path: string
  ) {
    super(
      `delete`,
      [{
        key: `path`,
        value: path
      }],
      (self: StepBase) => []
    )
  }

  async execute(): Promise<void> {
    let stats: null | fs.Stats = null

    try {
      stats = await fs.promises.stat(this.path)
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === `ENOENT`) {
        return
      }

      throw e
    }

    if (stats.isFile()) {
      await fs.promises.unlink(this.path)
    } else if (stats.isDirectory()) {
      await fs.promises.rm(this.path, { recursive: true })
    } else {
      throw new Error(`Unclear how to delete "${this.path}" (not a file or directory).`)
    }
  }
}
