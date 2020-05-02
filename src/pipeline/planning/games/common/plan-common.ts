import * as types from "../../../types"
import StepBase from "../../../steps/step-base"
import SerialStep from "../../../steps/aggregators/serial-step"
import ParallelStep from "../../../steps/aggregators/parallel-step"
import planGeneratedTypeScript from "./plan-generated-type-script"
import planTypeScript from "./plan-type-script"
import planSvg from "./plan-svg"
import planSvgCombination from "./plan-svg-combination"

export default function (
  typeSeparated: types.TypeSeparated
): StepBase {
  const generatedTypeScriptSteps = planGeneratedTypeScript(typeSeparated.sortedByKey.metadata)
  const typeScriptSteps = planTypeScript(typeSeparated.sortedByKey.typeScript)
  const svgSteps = planSvg(typeSeparated.sortedByKey.svg)
  const svgCombinationSteps = planSvgCombination(typeSeparated.sortedByKey.svg)

  return new SerialStep(
    `common`,
    [
      new ParallelStep(
        `files`,
        [generatedTypeScriptSteps, typeScriptSteps, svgSteps]
      ),
      svgCombinationSteps,
    ],
  )
}
