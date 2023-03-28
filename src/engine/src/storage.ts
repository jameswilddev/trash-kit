function engineStorageSave<T extends EngineJson> (key: string, content: T): Truthiness {
  try {
    localStorage.setItem(`${gameName}-${key}`, JSON.stringify(content))
    return truthy
  } catch { }
  return falsy
}

function engineStorageLoad<T extends EngineJson> (key: string): null | T {
  try {
    const json = localStorage.getItem(`${gameName}-${key}`)
    if (json !== null) {
      return JSON.parse(json)
    }
  } catch { }
  return null
}

function engineStorageDrop (key: string): Truthiness {
  try {
    localStorage.removeItem(`${gameName}-${key}`)
    return truthy
  } catch { }
  return falsy
}
