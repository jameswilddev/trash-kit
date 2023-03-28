import StoreBase from './store-base'

export default class KeyValueStore<TValue> extends StoreBase {
  private readonly keysAndValues = new Map<string, TValue>()

  hasKey (
    key: string
  ): boolean {
    return this.keysAndValues.has(key)
  }

  get (
    key: string
  ): TValue {
    if (this.hasKey(key)) {
      return this.keysAndValues.get(key) as TValue
    } else {
      throw new Error(`Unable to get key ${JSON.stringify(key)} which is not currently set in store "${this.name}".`)
    }
  }

  getAll (): ReadonlyMap<string, TValue> {
    return new Map(this.keysAndValues)
  }

  tryGet (
    key: string
  ): null | TValue {
    if (this.hasKey(key)) {
      return this.keysAndValues.get(key) as TValue
    } else {
      return null
    }
  }

  set (
    key: string,
    value: TValue
  ): void {
    if (this.hasKey(key)) {
      throw new Error(`Unable to set key ${JSON.stringify(key)} which is already set in store "${this.name}".`)
    } else {
      this.keysAndValues.set(key, value)
    }
  }

  deleteIfSet (
    key: string
  ): void {
    this.keysAndValues.delete(key)
  }
}
