import * as types from "../types"
import Diff from "./diff"

function assembleName(
  pathExcludingExtension: string,
  extension: string
): string {
  return pathExcludingExtension
    .split(/[\\\/]/g)
    .slice(1)
    .concat(extension)
    .map(
      segment => {
        const runs = segment.split(/[-\.]/g)
        return runs
          .slice(0, 1)
          .concat(
            runs
              .slice(1)
              .map(run => `${run.charAt(0).toUpperCase()}${run.slice(1)}`)
          )
          .join(``)
      }
    )
    .join(`_`)
}

export default function (
  diff: Diff<string>,
  debug: boolean
): {
  readonly engine: Diff<types.EngineFile>
  readonly game: Diff<types.GameFile>
} {
  const typeSeparated = diff.separate({
    engine: path => {
      const match = /^src[\\\/]engine[\\\/]src((?:[\\\/](?:[a-z][a-z0-9-]*[a-z0-9]|[a-z]))+)\.([a-z\.]*[a-z])$/
        .exec(path)
      if (match === null) {
        return null
      } else {
        return {
          path,
          name: assembleName(match[1], match[2]),
          extension: match[2]
        }
      }
    },
    game: path => {
      const srcMatch = /^src[\\\/]games[\\\/]([a-z]|[a-z][a-z0-9-]{0,48}[a-z0-9])[\\\/]src((?:[\\\/](?:[a-z][a-z0-9-]*[a-z0-9]|[a-z]))+)\.([a-z\.]*[a-z])$/
        .exec(path)
      if (srcMatch !== null) {
        const srcFile: types.GameSrcFile = {
          type: `src`,
          path,
          game: srcMatch[1],
          name: assembleName(srcMatch[2], srcMatch[3]),
          extension: srcMatch[3]
        }

        return srcFile
      }

      const metadataMatch = /^src[\\\/]games[\\\/]([a-z]|[a-z][a-z0-9-]{0,48}[a-z0-9])[\\\/]metadata\.json$/
        .exec(path)
      if (metadataMatch !== null) {
        const metadataFile: types.GameMetadataFile = {
          type: `metadata`,
          path,
          game: metadataMatch[1],
        }

        return metadataFile
      }

      return null
    },
  })

  const unsortedAddedOrUpdated = typeSeparated.unsorted.added
    .concat(typeSeparated.unsorted.updated)
  if (unsortedAddedOrUpdated.length > 0) {
    const message = `The following paths were not recognized: ${
      unsortedAddedOrUpdated
        .map(path => `\n\t${JSON.stringify(path)}`)
        .join(``)
      }`
    if (debug) {
      console.error(message)
    } else {
      throw new Error(message)
    }
  }

  return typeSeparated.sortedByKey
}
