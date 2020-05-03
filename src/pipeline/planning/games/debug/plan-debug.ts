import * as types from "../../../types"
import StepBase from "../../../steps/step-base"
import SerialStep from "../../../steps/aggregators/serial-step"
import ParallelStep from "../../../steps/aggregators/parallel-step"
import Diff from "../../../files/diff"
import planTsconfig from "./plan-tsconfig"
import planJavascriptGeneration from "./plan-javascript-generation"
import planHtmlGeneration from "./plan-html-generation"

export default function (
  games: Diff<string>,
  enginePlanningResult: types.EnginePlanningResult,
  typeSeparated: types.TypeSeparated,
): StepBase {
  return new ParallelStep(
    `debug`,
    [
      planTsconfig(games),
      new SerialStep(
        `build`,
        [
          planJavascriptGeneration(enginePlanningResult, typeSeparated.allSorted),
          planHtmlGeneration(enginePlanningResult, games),
        ]
      ),
    ]
  )
}
