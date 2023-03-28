import type * as types from '../../types'
import ActionStepBase from './action-step-base'
import type KeyValueStore from '../../stores/key-value-store'
import gameMetadataJsonStore from '../../stores/game-metadata-json-store'
import gameSvgDefStore from '../../stores/game-svg-def-store'

export default class GenerateDeclarationsStep extends ActionStepBase {
  constructor (
    private readonly game: string,
    private readonly engineDebug: boolean,
    private readonly engineUuid: string,
    private readonly gameDeclarationsStore: KeyValueStore<types.DeclarationSet>
  ) {
    super(
      'generateDeclarations',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    const declarations: types.Declaration[] = []

    declarations.push({
      type: 'constant',
      name: 'truthy',
      valueType: '1',
      value: 1
    })

    declarations.push({
      type: 'constant',
      name: 'falsy',
      valueType: 'undefined',
      value: undefined
    })

    declarations.push({
      type: 'constant',
      name: 'engineDebug',
      valueType: JSON.stringify(this.engineDebug),
      value: this.engineDebug
    })

    declarations.push({
      type: 'constant',
      name: 'engineUuid',
      valueType: JSON.stringify(this.engineUuid),
      value: this.engineUuid
    })

    const metadata = gameMetadataJsonStore.get(this.game)

    declarations.push({
      type: 'constant',
      name: 'gameName',
      valueType: JSON.stringify(this.game),
      value: this.game
    })

    declarations.push({
      type: 'constant',
      name: 'safeAreaWidthVirtualPixels',
      valueType: `${metadata.safeAreaWidthVirtualPixels}`,
      value: metadata.safeAreaWidthVirtualPixels
    })

    declarations.push({
      type: 'constant',
      name: 'safeAreaHeightVirtualPixels',
      valueType: `${metadata.safeAreaHeightVirtualPixels}`,
      value: metadata.safeAreaHeightVirtualPixels
    })

    const orderedSvgNames = [...gameSvgDefStore.tryGetAllByBaseKey(this.game).keys()].sort()

    orderedSvgNames.forEach((typeScriptName, index) => declarations.push({
      type: 'type',
      name: `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`,
      definition: `${index}`
    }))

    declarations.push({
      type: 'type',
      name: 'AnySvg',
      definition: orderedSvgNames.length === 0 ? 'never' : orderedSvgNames.map(typeScriptName => `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`).join(' | ')
    })

    orderedSvgNames.forEach((typeScriptName, index) => declarations.push({
      type: 'constant',
      name: typeScriptName,
      valueType: `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`,
      value: index
    }))

    this.gameDeclarationsStore.set(this.game, declarations)
  }
}
