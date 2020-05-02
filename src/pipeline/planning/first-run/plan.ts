import * as os from "os"
import * as path from "path"
const qrcodeTerminal = require(`qrcode-terminal`)
import ArbitraryStep from "../../steps/actions/arbitrary-step"
import StepBase from "../../steps/step-base"
import SerialStep from "../../steps/aggregators/serial-step"
import ParallelStep from "../../steps/aggregators/parallel-step"
import HostStep from "../../steps/actions/host-step"
import WriteFileStep from "../../steps/actions/files/write-file-step"
import planDeletionOfPreviousArtifacts from "./plan-deletion-of-previous-artifacts"
import planCreationOfDirectories from "./plan-creation-of-directories"
import planParsingOfTypeScriptLibraries from "./plan-parsing-of-type-script-libraries"
import gameMinifiedHtmlDebugStore from "../../stores/game-minified-html-debug-store"
import tsconfigContent from "../../steps/actions/type-script/tsconfig-content"
import ParsePugStep from "../../steps/actions/pug/parse-pug-step"
import gameListPugStore from "../../stores/game-list-pug-store"

export default function (
  firstRun: boolean,
  debug: boolean
): StepBase {
  const deletionOfPreviousArtifactsThenCreationOfDirectoriesSteps: StepBase[] = []
  const typeScriptSteps: StepBase[] = []
  const hostSteps: StepBase[] = []
  if (firstRun) {
    deletionOfPreviousArtifactsThenCreationOfDirectoriesSteps.push(
      planDeletionOfPreviousArtifacts(),
      planCreationOfDirectories()
    )
    typeScriptSteps.push(
      planParsingOfTypeScriptLibraries()
    )

    if (debug) {
      hostSteps.push(new ParsePugStep(
        path.join(__dirname, `game-list.pug`),
        parsed => gameListPugStore.set(parsed)
      ))

      hostSteps.push(
        new HostStep(
          gameMinifiedHtmlDebugStore,
          gameListPugStore,
        )
      )

      hostSteps.push(new ArbitraryStep(`displayQrCode`, async () => {
        let chosen = `127.0.0.1`

        for (const iface of Object.values(os.networkInterfaces())) {
          for (const address of iface) {
            if (address.family !== 'IPv4') {
              continue
            }

            if (address.internal) {
              continue
            }

            chosen = address.address
          }
        }

        console.log(`Scan the following QR code to open the game/list:`)
        qrcodeTerminal.generate(`http://${chosen}:3333`)
      }))
    }
  }

  return new ParallelStep(
    `firstRun`,
    [
      new SerialStep(
        `deletionOfPreviousArtifactsThenCreationOfDirectories`,
        deletionOfPreviousArtifactsThenCreationOfDirectoriesSteps
      ),
      new SerialStep(
        `loadTypeScriptThenHost`,
        [
          new ParallelStep(
            `loadTypeScript`,
            typeScriptSteps
          ),
          new SerialStep(
            `host`,
            hostSteps
          )
        ]
      ),
      new WriteFileStep(
        () => JSON.stringify({
          include: [
            path.join(`**`, `*.ts`),
            path.join(`**`, `*.d.ts`),
            path.join(`**`, `*.json`)
          ],
          compilerOptions: tsconfigContent
        }),
        path.join(`src`, `engine`, `tsconfig.json`)
      ),
    ]
  )
}
