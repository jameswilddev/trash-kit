import StepBase from "../../../steps/step-base"
import ParallelStep from "../../../steps/aggregators/parallel-step"
import Diff from "../../../files/diff"
import planDeletionOfTemporaryDirectories from "./plan-deletion-of-temporary-directories"
import planCreationOfTemporaryDirectories from "./plan-creation-of-temporary-directories"
import planTsconfig from "./plan-tsconfig"

export default function (
  games: Diff<string>,
): StepBase {
  return new ParallelStep(
    `debug`,
    [
      planDeletionOfTemporaryDirectories(games),
      planCreationOfTemporaryDirectories(games),
      planTsconfig(games),
    ]
  )
}
