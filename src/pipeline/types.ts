import type StepBase from './steps/step-base'
import type Diff from './files/diff'

export interface EngineFile {
  readonly path: string
  readonly name: string
  readonly extension: string
}

export interface GameSrcFile {
  readonly type: 'src'
  readonly path: string
  readonly game: string
  readonly name: string
  readonly extension: string
}

export interface GameMetadataFile {
  readonly type: 'metadata'
  readonly path: string
  readonly game: string
}

export type GameFile =
  | GameSrcFile
  | GameMetadataFile

export interface EnginePlanningResult {
  readonly allGamesRequireJavascriptRegeneration: boolean
  readonly allGamesRequireHtmlRegeneration: boolean
  readonly step: StepBase
}

export interface Versioned<T> {
  readonly payload: T
  readonly uuid: string
}

interface JsonObject extends Readonly<Record<string, Json>> {}
interface JsonArray extends ReadonlyArray<Json> { }
export type Json = string | number | boolean | Date | JsonObject | JsonArray

export interface MetadataJson extends JsonObject {
  readonly safeAreaWidthVirtualPixels: number
  readonly safeAreaHeightVirtualPixels: number
  readonly backgroundColor: string
}

export interface ConstantDeclaration {
  readonly type: 'constant'
  readonly name: string
  readonly valueType: string
  readonly value: any
}

export interface TypeDeclaration {
  readonly type: 'type'
  readonly name: string
  readonly definition: string
}

export type Declaration =
  | ConstantDeclaration
  | TypeDeclaration

export type DeclarationSet = readonly Declaration[]

export interface TypeSeparated {
  readonly sortedByKey: {
    readonly typeScript: Diff<GameSrcFile>
    readonly svg: Diff<GameSrcFile>
    readonly metadata: Diff<GameMetadataFile>
  }
  readonly allSorted: Diff<GameFile>
}
