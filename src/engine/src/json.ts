type EngineJson =
  | string
  | number
  | boolean
  | readonly EngineJson[]
  | { readonly [key: string]: EngineJson }
  | null
