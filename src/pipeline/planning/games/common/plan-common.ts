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
  return new SerialStep(
    `common`,
    [
      new ParallelStep(
        `files`,
        [
          planGeneratedTypeScript(typeSeparated.sortedByKey.metadata),
          planTypeScript(typeSeparated.sortedByKey.typeScript),
          planSvg(typeSeparated.sortedByKey.svg),
        ]
      ),
      planSvgCombination(typeSeparated.sortedByKey.svg),
    ],
  )
}
