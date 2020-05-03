import * as types from "../../../types"
import StepBase from "../../../steps/step-base"
import ParallelStep from "../../../steps/aggregators/parallel-step"
import Diff from "../../../files/diff"
import planTsconfig from "./plan-tsconfig"
import planJavascriptGeneration from "./plan-javascript-generation"

export default function (
  games: Diff<string>,
  enginePlanningResult: types.EnginePlanningResult,
  typeSeparated: types.TypeSeparated,
): StepBase {
  return new ParallelStep(
    `debug`,
    [
      planTsconfig(games),
      planJavascriptGeneration(enginePlanningResult, typeSeparated.allSorted),
    ]
  )
}
