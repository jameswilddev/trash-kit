type EngineJson =
  | string
  | number
  | boolean
  | ReadonlyArray<EngineJson>
  | { readonly [key: string]: EngineJson }
  | null
