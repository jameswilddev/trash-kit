import type * as types from '../../types'
import ActionStepBase from './action-step-base'
import type KeyValueStore from '../../stores/key-value-store'

export default class ConvertDeclarationsToTypeScriptStep extends ActionStepBase {
  constructor (
    private readonly ambient: boolean,
    private readonly game: string,
    private readonly gameDeclarationsStore: KeyValueStore<types.DeclarationSet>,
    private readonly gameDeclarationsTypeScriptTextStore: KeyValueStore<string>
  ) {
    super(
      'convertDeclarationsToTypeScript',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    const declarations = this.gameDeclarationsStore.get(this.game)

    const types = declarations
      .filter((declaration): declaration is types.TypeDeclaration => declaration.type === 'type')
      .map(typeDeclaration => `type ${typeDeclaration.name} = ${typeDeclaration.definition}`)

    const constants = declarations
      .filter((declaration): declaration is types.ConstantDeclaration => declaration.type === 'constant')
      .map(constantDeclaration => `${this.ambient ? 'declare ' : ''}const ${constantDeclaration.name}: ${constantDeclaration.valueType}${this.ambient ? '' : ` = ${JSON.stringify(constantDeclaration.value)}`}`)

    this.gameDeclarationsTypeScriptTextStore.set(this.game, types.concat(constants).join('\n'))
  }
}
