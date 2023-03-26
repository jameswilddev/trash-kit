import StepBase from '../step-base'

export default abstract class AggregatorStepBase extends StepBase {
  protected readonly children: readonly StepBase[]

  constructor (
    descriptionName: string,
    descriptionArguments: ReadonlyArray<{
      readonly key: string
      readonly value: string
    }>,
    descriptionLinks: (self: StepBase) => ReadonlyArray<{
      readonly from: StepBase
      readonly to: StepBase
    }>,
    children: readonly StepBase[]
  ) {
    super(
      descriptionName,
      descriptionArguments,
      descriptionLinks
    )
    this.children = children.slice()
  }
}
