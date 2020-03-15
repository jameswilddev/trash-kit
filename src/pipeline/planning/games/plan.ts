import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import ParallelStep from "../../steps/aggregators/parallel-step"
import SerialStep from "../../steps/aggregators/serial-step"
import separateByType from "./separate-by-type"
import planCreationOfTemporaryDirectories from "./plan-creation-of-temporary-directories"
import planGeneratedTypeScript from "./plan-generated-type-script"
import planTypeScript from "./plan-type-script"
import planSvg from "./plan-svg"
import planJavascriptGeneration from "./plan-javascript-generation"
import planHtmlGeneration from "./plan-html-generation"
import planTsconfig from "./plan-tsconfig"
import planDeletionOfTemporaryDirectories from "./plan-creation-of-temporary-directories"

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  gamesDiff: Diff<types.GameFile>
): StepBase {
  const typeSeparated = separateByType(debug, gamesDiff)
  const games = typeSeparated.allSorted
    .mapItems(item => item.game)
    .deduplicateItems()
  const creationOfTemporaryDirectoriesSteps = planCreationOfTemporaryDirectories(games)
  const generatedTypeScriptSteps = planGeneratedTypeScript(typeSeparated.sortedByKey.metadata)
  const typeScriptSteps = planTypeScript(typeSeparated.sortedByKey.typeScript)
  const svgSteps = planSvg(typeSeparated.sortedByKey.svg)
  const javaScriptSteps = planJavascriptGeneration(
    enginePlanningResult, typeSeparated.allSorted
  )
  const htmlGenerationSteps = planHtmlGeneration(
    enginePlanningResult, games
  )
  const tsconfigSteps = planTsconfig(games)
  const deletionOfTemporaryDirectoriesSteps = planDeletionOfTemporaryDirectories(games)

  return new ParallelStep(
    `games`,
    [
      creationOfTemporaryDirectoriesSteps,
      tsconfigSteps,
      new SerialStep(
        `builds`,
        [
          new ParallelStep(
            `files`,
            [generatedTypeScriptSteps, typeScriptSteps, svgSteps]
          ),
          javaScriptSteps,
          htmlGenerationSteps
        ]
      ),
      deletionOfTemporaryDirectoriesSteps,
    ]
  )
}
