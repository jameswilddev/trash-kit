interface EngineJsonObject extends Readonly<Record<string, Json>> { }
interface EngineJsonArray extends ReadonlyArray<Json> { }
type EngineJson = string | number | boolean | Date | EngineJsonObject | EngineJsonArray
