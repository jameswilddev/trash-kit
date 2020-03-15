const engineStateVersion = 4

type EngineState = {
  readonly engineVersion: number
  readonly gameVersion: number
  readonly state: State
}

function engineStateLoad(): void {
  const possibleState = engineStorageLoad<EngineState>(`state`)
  if (possibleState === null
    || possibleState.engineVersion !== engineStateVersion
    || possibleState.gameVersion !== version) {
    state = initial()
  } else {
    state = possibleState.state
  }
  engineStorageDrop(`state`)
}

function engineStateSave(): void {
  engineStorageSave<EngineState>(`state`, {
    engineVersion: engineStateVersion,
    gameVersion: version,
    state,
  })
}
