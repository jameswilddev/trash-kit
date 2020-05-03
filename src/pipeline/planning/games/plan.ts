import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import SerialStep from "../../steps/aggregators/serial-step"
import separateByType from "./common/separate-by-type"
import planCommon from "./common/plan-common"
import planDebug from "./debug/plan-debug"
import planProduction from "./production/plan-production"

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

  if (debug) {
    steps.push(planDebug(games, enginePlanningResult, typeSeparated))
  }

  steps.push(planProduction(debug, enginePlanningResult, games, typeSeparated))

  return new SerialStep(`games`, steps)
}
