import * as types from "../../../types"
import Diff from "../../../files/diff"

export default function (
  debug: boolean,
  gamesDiff: Diff<types.GameFile>
): types.TypeSeparated {
  const typeSeparated = gamesDiff.separate({
    typeScript: file => file.type === `src` && file.extension === `ts` ? file : null,
    svg: file => file.type === `src` && file.extension === `svg` ? file : null,
    metadata: file => file.type === `metadata` ? file : null,
  })

  const unsortedAddedOrUpdated = typeSeparated.unsorted.added
    .concat(typeSeparated.unsorted.updated)
  if (unsortedAddedOrUpdated.length > 0) {
    const message = `The following game paths were not recognized: ${
      unsortedAddedOrUpdated
        .map(path => `\n\t${JSON.stringify(path.path)}`)
        .join(``)
      }`
    if (debug) {
      console.error(message)
    } else {
      throw new Error(message)
    }
  }

  return typeSeparated
}
