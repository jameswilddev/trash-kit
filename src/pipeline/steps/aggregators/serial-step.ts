import type StepBase from '../../steps/step-base'
import type ActionStepBase from '../../steps/actions/action-step-base'
import AggregatorStepBase from './aggregator-step-base'

export default class SerialStep extends AggregatorStepBase {
  constructor (
    name: string,
    children: readonly StepBase[]
  ) {
    super(
      `${name} (serial)`,
      [],
      (self: StepBase) => children.length === 0
        ? []
        : [
            {
              from: self,
              to: children[0] as StepBase
            },
            ...children.slice(1).map((child, i) => ({
              from: children[i] as StepBase,
              to: child
            }))],
      children
    )
  }

  async executePerActionStep (
    onActionStep: (
      step: ActionStepBase,
      execute: () => Promise<void>
    ) => Promise<void>
  ): Promise<void> {
    for (const child of this.children) {
      await child.executePerActionStep(onActionStep)
    }
  }
}
