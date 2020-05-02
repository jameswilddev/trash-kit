import StepBase from "../../../steps/step-base"
import ParallelStep from "../../../steps/aggregators/parallel-step"
import Diff from "../../../files/diff"
import planTsconfig from "./plan-tsconfig"

export default function (
  games: Diff<string>,
): StepBase {
  return new ParallelStep(
    `debug`,
    [
      planTsconfig(games),
    ]
  )
}
