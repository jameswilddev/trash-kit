import * as types from "../types"
import KeyValueStore from "./key-value-store"

export default new KeyValueStore<types.Versioned<string>>(`gameHtmlDebug`)
