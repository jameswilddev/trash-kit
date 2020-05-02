import * as types from "../../types"
import StepBase from "../step-base"
import ActionStepBase from "./action-step-base"
import KeyValueStore from "../../stores/key-value-store"
import gameMetadataJsonStore from "../../stores/game-metadata-json-store"
import gameSvgDefStore from "../../stores/game-svg-def-store"

export default class GenerateDeclarationsStep extends ActionStepBase {
  constructor(
    private readonly game: string,
    private readonly engineDebug: boolean,
    private readonly engineUuid: string,
    private readonly gameDeclarationsStore: KeyValueStore<types.DeclarationSet>,
  ) {
    super(
      `generateDeclarations`,
      [],
      (self: StepBase) => []
    )
  }

  async execute(): Promise<void> {
    const declarations: types.Declaration[] = []


    declarations.push({
      type: `constant`,
      name: `engineDebug`,
      valueType: JSON.stringify(this.engineDebug),
      value: this.engineDebug,
    })

    declarations.push({
      type: `constant`,
      name: `engineUuid`,
      valueType: JSON.stringify(this.engineUuid),
      value: this.engineUuid,
    })


    const metadata = gameMetadataJsonStore.get(this.game)

    declarations.push({
      type: `constant`,
      name: `gameName`,
      valueType: JSON.stringify(this.game),
      value: this.game,
    })

    declarations.push({
      type: `constant`,
      name: `safeAreaWidthVirtualPixels`,
      valueType: `${metadata.safeAreaWidthVirtualPixels}`,
      value: metadata.safeAreaWidthVirtualPixels,
    })

    declarations.push({
      type: `constant`,
      name: `safeAreaHeightVirtualPixels`,
      valueType: `${metadata.safeAreaHeightVirtualPixels}`,
      value: metadata.safeAreaHeightVirtualPixels,
    })


    const orderedSvgNames = Object
      .keys(gameSvgDefStore.tryGetAllByBaseKey(this.game))
      .sort()

    orderedSvgNames.forEach((typeScriptName, index) => declarations.push({
      type: `type`,
      name: `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`,
      definition: `\`d${index}\``,
    }))

    declarations.push({
      type: `type`,
      name: `AnySvg`,
      definition: orderedSvgNames.map(typeScriptName => `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`).join(` | `),
    })

    orderedSvgNames.forEach((typeScriptName, index) => declarations.push({
      type: `constant`,
      name: typeScriptName,
      valueType: `${typeScriptName.slice(0, 1).toUpperCase()}${typeScriptName.slice(1)}`,
      value: `d${index}`,
    }))

    this.gameDeclarationsStore.set(this.game, declarations)
  }
}
