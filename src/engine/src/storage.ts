function saveLoadAvailable(): Truthiness {
  try {
    localStorage.setItem(`${gameName}-check`, `check`)
    return 1
  } catch { }
  return
}

function engineStorageSave<T extends EngineJson>(key: string, content: T): Truthiness {
  try {
    localStorage.setItem(`${gameName}-${key}`, JSON.stringify(content))
    return 1
  } catch { }
  return
}

function engineStorageLoad<T extends EngineJson>(key: string): null | T {
  try {
    const json = localStorage.getItem(`${gameName}-${key}`)
    if (json !== null) {
      return JSON.parse(json)
    }
  } catch { }
  return null
}

function engineStorageDrop(key: string): Truthiness {
  try {
    localStorage.removeItem(`${gameName}-${key}`)
    return 1
  } catch { }
  return
}
