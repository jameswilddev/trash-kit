import * as express from "express"
import * as types from "../../types"
import StepBase from "../step-base"
import ActionStepBase from "./action-step-base"

export default class HostStep extends ActionStepBase {
  constructor(
    private readonly tryGetHtml: (gameName: string) => null | types.Versioned<string>
  ) {
    super(
      `host`,
      [],
      (self: StepBase) => []
    )
  }

  async execute(): Promise<void> {
    return new Promise(
      (resolve, reject) => express()
        .get(/^\/([a-z]|[a-z][a-z0-9-]{0,48}[a-z0-9])$/, (request, response) => {
          const gameName = Array.isArray(request.params) ? request.params[0] : request.params[0]
          const html = this.tryGetHtml(gameName)
          if (html === null) {
            response.sendStatus(404)
          } else {
            response.send(html.payload)
          }
        })
        .get(/^\/([a-z]|[a-z][a-z0-9-]{0,48}[a-z0-9])\/uuid$/, (request, response) => {
          const gameName = Array.isArray(request.params) ? request.params[0] : request.params[0]
          const html = this.tryGetHtml(gameName)
          if (html === null) {
            response.sendStatus(404)
          } else {
            response.setHeader(`content-type`, `text/plain`)
            response.send(html.uuid)
          }
        })
        .listen(3333, resolve)
    )
  }
}
