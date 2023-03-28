import type ActionStepBase from './actions/action-step-base'
import * as uuid from 'uuid'

export default abstract class StepBase {
  private readonly uuid: string
  private readonly descriptionArguments: ReadonlyArray<{
    readonly key: string
    readonly value: string
  }>

  private readonly descriptionLinks: ReadonlyArray<{
    readonly from: StepBase
    readonly to: StepBase
  }>

  constructor (
    private readonly descriptionName: string,
    descriptionArguments: ReadonlyArray<{
      readonly key: string
      readonly value: string
    }>,
    descriptionLinks: (self: StepBase) => ReadonlyArray<{
      readonly from: StepBase
      readonly to: StepBase
    }>
  ) {
    this.uuid = uuid.v4()
    this.descriptionArguments = descriptionArguments
      .map(argument => ({
        key: argument.key,
        value: argument.value
      }))
    this.descriptionLinks = descriptionLinks(this)
      .map(link => ({
        from: link.from,
        to: link.to
      }))
  }

  abstract executePerActionStep (
    onActionStep: (
      step: ActionStepBase,
      execute: () => Promise<void>
    ) => Promise<void>
  ): Promise<void>

  getSingleLineDescription (): string {
    return `${this.descriptionName}(${[{
      key: 'uuid',
      value: this.uuid
    }]
      .concat(this.descriptionArguments)
      .map(argument => `${argument.key}: ${JSON.stringify(argument.value)}`)
      .join(', ')})`
  }

  getNomNoml (): string {
    const distinctLinked: StepBase[] = []
    this.descriptionLinks
      .map(descriptionLink => [descriptionLink.from, descriptionLink.to])
      .reduce((a, b) => a.concat(b), [])
      .filter(step => step !== this)
      .forEach(step => {
        if (!distinctLinked.includes(step)) {
          distinctLinked.push(step)
        }
      })
    return `[${this.uuid};${this.descriptionName}${this.descriptionArguments.map(argument => `|${argument.key}: ${argument.value}`).join('')}]${distinctLinked.map(linked => `\n${linked.getNomNoml()}`).join('')}${this.descriptionLinks.map(link => `\n[${link.from.uuid}] -> [${link.to.uuid}]`).join('')}`
  }
}
