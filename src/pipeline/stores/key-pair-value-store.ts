import StoreBase from './store-base'

export default class KeyPairValueStore<TValue> extends StoreBase {
  private readonly keyPairsAndValues = new Map<string, Map<string, TValue>>()

  hasBaseKey (
    a: string
  ): boolean {
    return this.keyPairsAndValues.has(a)
  }

  hasKeyPair (
    a: string,
    b: string
  ): boolean {
    return this.hasBaseKey(a) &&
  (this.keyPairsAndValues.get(a) as Map<string, TValue>).has(b)
  }

  get (
    a: string,
    b: string
  ): TValue {
    if (this.hasKeyPair(a, b)) {
      return (this.keyPairsAndValues.get(a) as Map<string, TValue>).get(b) as TValue
    } else if (this.hasBaseKey(a)) {
      throw new Error(`Unable to retrieve key pair ${JSON.stringify(a)}:${JSON.stringify(b)} of which the second is not set in store "${this.name}".`)
    } else {
      throw new Error(`Unable to retrieve key pair ${JSON.stringify(a)}:${JSON.stringify(b)} of which the first is not set in store "${this.name}".`)
    }
  }

  tryGetAllByBaseKey (
    a: string
  ): ReadonlyMap<string, TValue> {
    const output = new Map<string, TValue>()
    if (this.hasBaseKey(a)) {
      const subset = this.keyPairsAndValues.get(a) as Map<string, TValue>

      for (const [key, value] of subset.entries()) {
        output.set(key, value)
      }
    }
    return output
  }

  set (
    a: string,
    b: string,
    value: TValue
  ): void {
    if (this.hasKeyPair(a, b)) {
      throw new Error(`Unable to set key pair ${JSON.stringify(a)}:${JSON.stringify(b)} which is already set in store "${this.name}".`)
    } else {
      if (!this.hasBaseKey(a)) {
        this.keyPairsAndValues.set(a, new Map())
      }

      (this.keyPairsAndValues.get(a) as Map<string, TValue>).set(b, value)
    }
  }

  deleteIfSet (
    a: string,
    b: string
  ): void {
    if (this.hasKeyPair(a, b)) {
      const subset = this.keyPairsAndValues.get(a) as Map<string, TValue>

      if (subset.size === 1) {
        this.keyPairsAndValues.delete(a)
      } else {
        subset.delete(b)
      }
    }
  }
}
