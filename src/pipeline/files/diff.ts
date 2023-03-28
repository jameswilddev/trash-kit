import type StepBase from '../steps/step-base'
import SerialStep from '../steps/aggregators/serial-step'
import ParallelStep from '../steps/aggregators/parallel-step'

export default class Diff<T> {
  constructor (
    public readonly added: ReadonlySet<T>,
    public readonly updated: ReadonlySet<T>,
    public readonly deleted: ReadonlySet<T>,
    public readonly unmodified: ReadonlySet<T>
  ) {
  }

  mapSets<TOutput>(
    callback: (input: ReadonlySet<T>) => ReadonlySet<TOutput>
  ): Diff<TOutput> {
    return new Diff<TOutput>(
      callback(this.added),
      callback(this.updated),
      callback(this.deleted),
      callback(this.unmodified)
    )
  }

  mapItems<TOutput>(
    callback: (input: T) => TOutput
  ): Diff<TOutput> {
    return this.mapSets(set => new Set([...set].map(callback)))
  }

  filter (
    callback: (item: T) => boolean
  ): Diff<T> {
    return this.mapSets(set => new Set([...set].filter(callback)))
  }

  separate<TBy extends Readonly<Record<string, any>>>(
    callbacks: { readonly [key in keyof TBy]: (item: T) => null | TBy[key] }
  ): {
      readonly sortedByKey: { readonly [key in keyof TBy]: Diff<TBy[key]> }
      readonly allSorted: Diff<T>
      readonly unsorted: Diff<T>
    } {
    let anyMatches: (item: T) => boolean = () => false
    let noMatches: (item: T) => boolean = () => true
    for (const key in callbacks) {
      const oldAnyMatches = anyMatches
      const oldNoMatches = noMatches
      const nextCallback = callbacks[key]
      anyMatches = item => oldAnyMatches(item) || nextCallback(item) !== null
      noMatches = item => oldNoMatches(item) && nextCallback(item) === null
    }

    const output: {
      sortedByKey: Record<string, Diff<any>>
      readonly allSorted: Diff<T>
      readonly unsorted: Diff<T>
    } = {
      sortedByKey: {},
      allSorted: this.filter(anyMatches),
      unsorted: this.filter(noMatches)
    }

    for (const key in callbacks) {
      const callback = callbacks[key]
      output.sortedByKey[key] = this.mapItems(callback).filter(item => item !== null)
    }

    return output as {
      readonly sortedByKey: { readonly [key in keyof TBy]: Diff<TBy[key]> }
      readonly allSorted: Diff<T>
      readonly unsorted: Diff<T>
    }
  }

  requiresClean (): boolean {
    return this.added.size > 0 ||
      this.updated.size > 0 ||
      this.deleted.size > 0
  }

  requiresGenerate (): boolean {
    return this.added.size > 0 ||
      this.updated.size > 0 ||
      (this.deleted.size > 0 && this.unmodified.size > 0)
  }

  invalidatesDependents (): boolean {
    return this.requiresClean() || this.requiresGenerate()
  }

  generateSteps (
    name: string,
    regenerateAll: boolean,
    describe: (item: T) => string,
    cleanStepsFactory: (item: T) => readonly StepBase[],
    generateStepsFactory: (item: T) => readonly StepBase[]
  ): StepBase {
    const steps: StepBase[] = []

    const itemsToClean = regenerateAll
      ? new Set([...this.updated, ...this.deleted, ...this.unmodified])
      : new Set([...this.updated, ...this.deleted])

    const itemsToGenerate = regenerateAll
      ? new Set([...this.added, ...this.updated, ...this.unmodified])
      : new Set([...this.added, ...this.updated]);

    [...itemsToGenerate]
      .filter(item => !itemsToClean.has(item))
      .forEach(item => steps.push(new SerialStep(describe(item), generateStepsFactory(item))));

    [...itemsToGenerate]
      .filter(item => itemsToClean.has(item))
      .forEach(item => steps.push(new SerialStep(describe(item), new Array<StepBase>(new ParallelStep('clean', cleanStepsFactory(item))).concat(generateStepsFactory(item)))));

    [...itemsToClean]
      .filter(item => !itemsToGenerate.has(item))
      .forEach(item => { cleanStepsFactory(item).forEach(step => steps.push(step)) })

    return new ParallelStep(name, steps)
  }

  deduplicateItems (): Diff<T> {
    const distinctUpdated = new Set(
      [...this.updated, ...[...this.added].filter(item => this.unmodified.has(item))]
    )

    const distinctUnmodified = new Set(
      [...this.unmodified].filter(item => !distinctUpdated.has(item))
    )

    const distinctAdded = new Set([...this.added].filter(item =>
      !distinctUnmodified.has(item) && !distinctUpdated.has(item)
    ))

    const distinctDeleted = new Set([...this.deleted].filter(item =>
      !distinctUnmodified.has(item) &&
      !distinctUpdated.has(item) &&
      !distinctAdded.has(item)
    ))

    return new Diff(
      distinctAdded,
      distinctUpdated,
      distinctDeleted,
      distinctUnmodified
    )
  }
}
