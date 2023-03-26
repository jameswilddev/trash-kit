import type * as fs from 'fs'
import * as chokidar from 'chokidar'
import isMonitored from './is-monitored'

export default async function (
  onChange: (fileVersions: ReadonlyMap<string, number>) => Promise<void>
): Promise<void> {
  await new Promise<void>((_resolve, reject) => {
    let running = false
    let invalidated = false
    let throttling: null | NodeJS.Timer = null
    const pathVersions = new Map<string, number>()
    let ranAtLeastOnce = false

    startThrottling()
    chokidar
      .watch('src', {
        awaitWriteFinish: {
          stabilityThreshold: 250,
          pollInterval: 50
        }
      })
      .on('add', (path, stats) => { handle('add', path, stats) })
      .on('change', (path, stats) => { handle('change', path, stats) })
      .on('unlink', path => {
        if (isMonitored(path)) {
          console.log(`"unlink" of "${path}"`)
          pathVersions.delete(path)
          invalidate()
        }
      })
      .on('error', error => { throw error })

    function handle (event: string, path: string, stats: undefined | fs.Stats): void {
      if (isMonitored(path)) {
        if (ranAtLeastOnce) {
          console.log(`"${event}" of "${path}"`)
        }
        if (stats == null) {
          reject(new Error(`No stats for "${event}" of "${path}"`))
        } else {
          pathVersions.set(path, stats.mtime.getTime())
          invalidate()
        }
      }
    }

    function invalidate (): void {
      if (running) {
        console.log('Waiting to restart...')
        invalidated = true
        return
      }

      if (throttling === null) {
        if (ranAtLeastOnce) {
          console.log('Throttling...')
        }
      } else {
        if (ranAtLeastOnce) {
          console.log('Continuing to throttle...')
        }
        clearTimeout(throttling)
      }

      startThrottling()
    }

    function startThrottling (): void {
      throttling = setTimeout(() => {
        ranAtLeastOnce = true
        throttling = null
        invalidated = false
        running = true
        onChange(
          new Map(pathVersions)
        ).then(
          () => {
            running = false
            if (invalidated) {
              invalidate()
            }
          },
          reject
        )
      }, ranAtLeastOnce ? 200 : 5000)
    }
  })
}
