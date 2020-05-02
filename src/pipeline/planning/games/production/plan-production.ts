import * as types from "../../../types"
import Diff from "../../../files/diff"
import StepBase from "../../../steps/step-base"
import SerialStep from "../../../steps/aggregators/serial-step"
import planJavascriptGeneration from "./plan-javascript-generation"
import planHtmlGeneration from "./plan-html-generation"

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  games: Diff<string>,
  typeSeparated: types.TypeSeparated,
): StepBase {
  return new SerialStep(
    `production`,
    [
      planJavascriptGeneration(debug, enginePlanningResult, typeSeparated.allSorted),
      planHtmlGeneration(debug, enginePlanningResult, games),
    ],
  )
}
