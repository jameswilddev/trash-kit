import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import SerialStep from "../../steps/aggregators/serial-step"
import separateByType from "./common/separate-by-type"
import planCreationOfTemporaryDirectories from "./debug/plan-creation-of-temporary-directories"
import planCommon from "./common/plan-common"
import planJavascriptGeneration from "./plan-javascript-generation"
import planHtmlGeneration from "./plan-html-generation"
import planTsconfig from "./debug/plan-tsconfig"
import planDeletionOfTemporaryDirectories from "./debug/plan-creation-of-temporary-directories"

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  gamesDiff: Diff<types.GameFile>
): StepBase {
  const typeSeparated = separateByType(debug, gamesDiff)
  const games = typeSeparated.allSorted
    .mapItems(item => item.game)
    .deduplicateItems()

  const steps: StepBase[] = []

  steps.push(planCommon(typeSeparated))
  steps.push(planCreationOfTemporaryDirectories(games))
  steps.push(planTsconfig(games))
  steps.push(planJavascriptGeneration(debug, enginePlanningResult, typeSeparated.allSorted))
  steps.push(planHtmlGeneration(debug, enginePlanningResult, games))
  steps.push(planDeletionOfTemporaryDirectories(games))

  return new SerialStep(`games`, steps)
}
