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

export type GeneratedHtml = {
  readonly html: string
  readonly uuid: string
}

export type Json =
  | string
  | number
  | boolean
  | ReadonlyArray<Json>
  | { readonly [key: string]: Json }
  | null

