import type * as types from '../../../types'
import type StepBase from '../../../steps/step-base'
import SerialStep from '../../../steps/aggregators/serial-step'
import ParallelStep from '../../../steps/aggregators/parallel-step'
import planGeneratedTypeScript from './plan-generated-type-script'
import planTypeScript from './plan-type-script'
import planSvg from './plan-svg'
import planSvgCombination from './plan-svg-combination'

export default function (
  typeSeparated: types.TypeSeparated
): StepBase {
  return new ParallelStep(
    'common',
    [
      planGeneratedTypeScript(typeSeparated.sortedByKey.metadata),
      planTypeScript(typeSeparated.sortedByKey.typeScript),
      new SerialStep(
        'svg',
        [
          planSvg(typeSeparated.sortedByKey.svg),
          planSvgCombination(typeSeparated.sortedByKey.svg)
        ]
      )
    ]
  )
}
