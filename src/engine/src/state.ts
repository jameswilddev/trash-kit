const engineStateVersion = 4

interface EngineState extends EngineJsonObject {
  readonly engineVersion: number
  readonly gameVersion: number
  readonly state: State
}

function engineStateLoad (): void {
  if (engineDebug) {
    const possibleState = engineStorageLoad<EngineState>('state')
    if (possibleState === null ||
      possibleState.engineVersion !== engineStateVersion ||
      possibleState.gameVersion !== version) {
      state = initial()
    } else {
      state = possibleState.state
    }
    engineStorageDrop('state')

    onunload = () => {
      engineStorageSave<EngineState>('state', {
        engineVersion: engineStateVersion,
        gameVersion: version,
        state
      })
    }
  } else {
    state = initial()
  }
}
