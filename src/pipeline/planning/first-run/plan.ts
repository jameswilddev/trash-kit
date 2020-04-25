import * as path from "path"
import StepBase from "../../steps/step-base"
import SerialStep from "../../steps/aggregators/serial-step"
import ParallelStep from "../../steps/aggregators/parallel-step"
import HostStep from "../../steps/actions/host-step"
import WriteFileStep from "../../steps/actions/files/write-file-step"
import planDeletionOfPreviousArtifacts from "./plan-deletion-of-previous-artifacts"
import planCreationOfDirectories from "./plan-creation-of-directories"
import planParsingOfTypeScriptLibraries from "./plan-parsing-of-type-script-libraries"
import planParsingOfEnvironment from "./plan-parsing-of-environment"
import gameMinifiedHtmlDebugStore from "../../stores/game-minified-html-debug-store"
import tsconfigContent from "../../steps/actions/type-script/tsconfig-content"

export default function (
  firstRun: boolean,
  debug: boolean
): StepBase {
  const deletionOfPreviousArtifactsThenCreationOfDirectoriesSteps: StepBase[] = []
  const typeScriptSteps: StepBase[] = []
  const environmentSteps: StepBase[] = []
  const hostSteps: StepBase[] = []
  if (firstRun) {
    deletionOfPreviousArtifactsThenCreationOfDirectoriesSteps.push(
      planDeletionOfPreviousArtifacts(),
      planCreationOfDirectories()
    )
    typeScriptSteps.push(
      planParsingOfTypeScriptLibraries()
    )

    for (const step of planParsingOfEnvironment(debug)) {
      environmentSteps.push(step)
    }

    if (debug) {
      hostSteps.push(
        new HostStep(
          gameName => gameMinifiedHtmlDebugStore.tryGet(gameName)
        )
      )
    }
  }

  return new ParallelStep(
    `firstRun`,
    [
      new SerialStep(
        `deletionOfPreviousArtifactsThenCreationOfDirectories`,
        deletionOfPreviousArtifactsThenCreationOfDirectoriesSteps
      ),
      new ParallelStep(
        `parseEnvironments`,
        environmentSteps
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
