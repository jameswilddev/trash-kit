import Diff from './diff'

export default function (
  previousFileVersions: ReadonlyMap<string, number>,
  nextFileVersions: ReadonlyMap<string, number>
): Diff<string> {
  const previousKeys = new Set(previousFileVersions.keys())
  const nextKeys = new Set(nextFileVersions.keys())
  const commonKeys = new Set([...previousKeys].filter(key => nextKeys.has(key)))
  return new Diff<string>(
    new Set([...nextKeys].filter(key => !previousKeys.has(key))),
    new Set([...commonKeys].filter(key => previousFileVersions.get(key) !== nextFileVersions.get(key))),
    new Set([...previousKeys].filter(key => !nextKeys.has(key))),
    new Set([...commonKeys].filter(key => previousFileVersions.get(key) === nextFileVersions.get(key)))
  )
}
