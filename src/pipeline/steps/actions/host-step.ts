import * as express from 'express'
import type * as pug from 'pug'
import type * as types from '../../types'
import ActionStepBase from './action-step-base'
import type KeyValueStore from '../../stores/key-value-store'
import type ValueStore from '../../stores/value-store'

export default class HostStep extends ActionStepBase {
  constructor (
    private readonly gameHtmlStore: KeyValueStore<types.Versioned<string>>,
    private readonly gameListPugStore: ValueStore<pug.compileTemplate>
  ) {
    super(
      'host',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    await new Promise<void>(
      (resolve) => express()
        .get('/', (_, response) => {
          const games = Object.keys(this.gameHtmlStore.getAll()).sort()

          if (games.length === 1) {
            response.redirect(games[0] as string)
          } else {
            response.send(this.gameListPugStore.get()({
              games
            }))
          }
        })
        .get(/^\/([a-z]|[a-z][a-z0-9-]{0,48}[a-z0-9])$/, (request, response) => {
          const gameName = Array.isArray(request.params) ? request.params[0] : request.params[0]
          const html = this.gameHtmlStore.tryGet(gameName)
          if (html === null) {
            response.sendStatus(404)
          } else {
            response.send(html.payload)
          }
        })
        .get(/^\/([a-z]|[a-z][a-z0-9-]{0,48}[a-z0-9])\/uuid$/, (request, response) => {
          const gameName = Array.isArray(request.params) ? request.params[0] : request.params[0]
          const html = this.gameHtmlStore.tryGet(gameName)
          if (html === null) {
            response.sendStatus(404)
          } else {
            response.setHeader('content-type', 'text/plain')
            response.send(html.uuid)
          }
        })
        .listen(3333, resolve)
    )
  }
}
