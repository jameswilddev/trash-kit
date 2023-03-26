import type * as types from '../../../types'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import SerialStep from '../../../steps/aggregators/serial-step'
import planJavascriptGeneration from './plan-javascript-generation'
import planHtmlGeneration from './plan-html-generation'

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  games: Diff<string>,
  typeSeparated: types.TypeSeparated
): StepBase {
  return new SerialStep(
    'production',
    [
      planJavascriptGeneration(enginePlanningResult, typeSeparated.allSorted),
      planHtmlGeneration(debug, enginePlanningResult, games)
    ]
  )
}
