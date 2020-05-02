import StepBase from "./steps/step-base"

export type FileVersions = {
  readonly [path: string]: number
}

export type EngineFile = {
  readonly path: string
  readonly name: string
  readonly extension: string
}

export type GameSrcFile = {
  readonly type: `src`
  readonly path: string
  readonly game: string
  readonly name: string
  readonly extension: string
}

export type GameMetadataFile = {
  readonly type: `metadata`
  readonly path: string
  readonly game: string
}

export type GameFile =
  | GameSrcFile
  | GameMetadataFile

export type EnginePlanningResult = {
  readonly allGamesRequireJavascriptRegeneration: boolean
  readonly allGamesRequireHtmlRegeneration: boolean
  readonly step: StepBase
}

export type Versioned<T> = {
  readonly payload: T
  readonly uuid: string
}

export type Json =
  | string
  | number
  | boolean
  | ReadonlyArray<Json>
  | { readonly [key: string]: Json }
  | null

export type MetadataJson = {
  readonly safeAreaWidthVirtualPixels: number
  readonly safeAreaHeightVirtualPixels: number
  readonly backgroundColor: string
}

export type ConstantDeclaration = {
  readonly type: `constant`
  readonly name: string
  readonly valueType: string
  readonly value: Json
}

export type TypeDeclaration = {
  readonly type: `type`
  readonly name: string
  readonly definition: string
}

export type Declaration =
  | ConstantDeclaration
  | TypeDeclaration

export type DeclarationSet = ReadonlyArray<Declaration>
