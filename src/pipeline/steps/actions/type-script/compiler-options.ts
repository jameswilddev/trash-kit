import * as typeScript from 'typescript'

const output: typeScript.CompilerOptions = {
  allowJs: false,
  allowSyntheticDefaultImports: false,
  allowUmdGlobalAccess: false,
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  alwaysStrict: true,
  baseUrl: './',
  checkJs: false,
  composite: false,
  declaration: false,
  declarationMap: false,
  disableReferencedProjectLoad: true,
  disableSolutionSearching: true,
  disableSourceOfProjectReferenceRedirect: true,
  downlevelIteration: false,
  emitBOM: false,
  emitDeclarationOnly: false,
  emitDecoratorMetadata: false,
  esModuleInterop: false,
  exactOptionalPropertyTypes: true,
  experimentalDecorators: false,
  forceConsistentCasingInFileNames: true,
  importHelpers: false,
  inlineSourceMap: false,
  inlineSources: false,
  isolatedModules: false,
  jsx: typeScript.JsxEmit.Preserve,
  keyofStringsOnly: false,
  lib: [
    'es5',
    'dom'
  ],
  mapRoot: '',
  maxNodeModuleJsDepth: 0,
  module: typeScript.ModuleKind.None,
  moduleResolution: typeScript.ModuleResolutionKind.Classic,
  moduleSuffixes: [],
  newLine: typeScript.NewLineKind.LineFeed,
  noEmit: false,
  noEmitHelpers: true,
  noEmitOnError: true,
  noFallthroughCasesInSwitch: true,
  noImplicitAny: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noImplicitThis: true,
  noLib: false,
  noPropertyAccessFromIndexSignature: true,
  noResolve: false,
  noUncheckedIndexedAccess: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  outFile: 'result.js',
  preserveConstEnums: false,
  preserveSymlinks: false,
  preserveWatchOutput: true,
  pretty: true,
  removeComments: true,
  skipDefaultLibCheck: false,
  skipLibCheck: false,
  sourceMap: false,
  strict: true,
  strictBindCallApply: true,
  strictFunctionTypes: true,
  strictNullChecks: true,
  strictPropertyInitialization: true,
  stripInternal: true,
  target: typeScript.ScriptTarget.ES5,
  typeRoots: [],
  types: [
  ],
  useDefineForClassFields: true,
  useUnknownInCatchVariables: true
}

export default output
