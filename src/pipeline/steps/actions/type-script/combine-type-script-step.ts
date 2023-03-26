import * as path from 'path'
import * as typeScript from 'typescript'
import ActionStepBase from '../action-step-base'
import libraryTypeScriptParsedStore from '../../../stores/library-type-script-parsed-store'
import compilerOptions from './compiler-options'

export default class CombineTypeScriptStep extends ActionStepBase {
  constructor (
    private readonly getParsed: () => ReadonlyArray<ReadonlyMap<string, typeScript.SourceFile>>,
    private readonly storeJavascript: (javascript: string) => void
  ) {
    super(
      'combineTypeScript',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    const nonLibraries = new Map(this.getParsed().flatMap(map => Array.from(map.entries())))
    const libraries = libraryTypeScriptParsedStore.getAll()

    const allSourceFiles = new Map([...nonLibraries, ...libraries])

    const host = typeScript.createCompilerHost({})

    host.getSourceFile = (fileName: string, _: typeScript.ScriptTarget, onError?: (message: string) => void): typeScript.SourceFile | undefined => {
      // TypeScript always seems to use forward slashes.
      fileName = fileName.replace(/\//g, path.sep)

      const output = allSourceFiles.get(fileName)

      if (output === undefined) {
        const message = `Request for unexpected file ${JSON.stringify(fileName)}.`
        if (onError !== undefined) {
          onError(message)
          return undefined
        } else {
          throw new Error(message)
        }
      } else {
        return output
      }
    }

    host.writeFile = (fileName: string, data: string, _: boolean, onError?: (message: string) => void) => {
      switch (fileName) {
        case 'result.js':
          this.storeJavascript(data)
          break

        default: {
          const message = `Unexpected attempt to write file ${JSON.stringify(fileName)}.`
          if (onError !== undefined) {
            onError(message)
          } else {
            throw new Error(message)
          }
        }
      }
    }

    const program = typeScript.createProgram({
      rootNames: Object.keys(allSourceFiles).sort(),
      options: compilerOptions,
      host,
      configFileParsingDiagnostics: []
    })

    const emitResult = program.emit()

    if (emitResult.diagnostics.length > 0) {
      let message = 'Failed to combine TypeScript: '
      for (const diagnostic of emitResult.diagnostics) {
        const fileName = diagnostic.file !== undefined
          ? diagnostic.file.fileName
          : '(unknown)'
        const line = diagnostic.start !== undefined && diagnostic.file !== undefined
          ? `@${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}`
          : ''
        if (typeof diagnostic.messageText === 'string') {
          message += `\n${fileName}${line}: ${JSON.stringify(diagnostic.messageText)}`
        } else {
          function recurseChain (
            chain: typeScript.DiagnosticMessageChain
          ): void {
            message += `\n${fileName}${line}: ${JSON.stringify(chain.messageText)}`
            if (chain.next != null) {
              for (const item of chain.next) {
                recurseChain(item)
              }
            }
          }
          recurseChain(diagnostic.messageText)
        }
      }
      throw new Error(message)
    }
  }
}
